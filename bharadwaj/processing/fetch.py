import boto3
from bs4 import BeautifulSoup
from loguru import logger
import os
import pandas as pd
import pytesseract
import re
import requests
import yaml
import io
from cltk.corpus.sanskrit.itrans.unicode_transliterate import ItransTransliterator as itt
from PIL import Image, ImageChops, ImageOps
from itertools import accumulate
import json
import functools

CONFIG_FILE = "config.yml"
config = yaml.load(open(CONFIG_FILE, "r"))
logger.add(config['logfile'])

import functools

def debug(func):
    # Print the function signature and return value
    # https://realpython.com/primer-on-python-decorators/#debugging-code
    @functools.wraps(func)
    def wrapper_debug(*args, **kwargs):
        args_repr = [repr(a) for a in args]                      # 1
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]  # 2
        signature = ", ".join(args_repr + kwargs_repr)           # 3
        logger.debug(f"Calling {func.__name__}({signature})")
        value = func(*args, **kwargs)
        logger.debug(f"{func.__name__!r} returned {value!r}")           # 4
        return value
    return wrapper_debug


def debug_nosig(func):
    # Print the function signature and return value
    # https://realpython.com/primer-on-python-decorators/#debugging-code
    @functools.wraps(func)
    def wrapper_debug(*args, **kwargs):
        args_repr = [repr(a) for a in args]                      # 1
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]  # 2
        signature = ", ".join(args_repr + kwargs_repr)           # 3
        logger.debug(f"Calling {func.__name__!r}")
        value = func(*args, **kwargs)
        logger.debug(f"{func.__name__!r} returned {value!r}")           # 4
        return value
    return wrapper_debug


@debug
def safe_run(function, *args):
    try:
        return function(*args)
    except Exception as e:
        logger.debug(e)
        os._exit(1)

@debug_nosig
def dump(obj, path):
    with open(path,"w+") as f:
        json.dump(obj, f)

class Fetcher(object):

    def __init__(self):
        self.links = []
        self.images = []

    @debug
    def fetch_links(self):
        body = safe_run(requests.get, config['archive_url']).text
        soup = BeautifulSoup(body, 'lxml')
        self.links = [ re.sub( "//", "https://", link.get('href')) \
         for link in soup.findAll('a', \
                                  attrs={'href' : re.compile(".*jpg$") } \
                                  ) \
             ]

    @debug
    def fetch_images(self):
        self.images = [ Image.open( \
                          io.BytesIO( \
                                     requests.get(x).content \
                                     ) \
                          ) for x in self.links ]

class Parser(object):

    def __init__(self, pages):
        self.pages = pages
        self.text = []
        self.roman = []
        self.window = []

    def split(self):
        data = []
        pattern = re.compile("(?<=[(॥)?])\s*")
        for idx, page in enumerate(self.pages):
            inv_page = page[::-1]
            matches = pattern.finditer(inv_page)
            bar_positions = [ match.start() - 1 for match in matches ]
            if len(bar_positions) % 2:
                logger.debug("Mismatched separators at page index " + str(idx))
            vpos = [ v for i,v in enumerate(bar_positions) if not i % 2 ]
            vpos = [ (vpos[i],vpos[i+1]-1) for i in range(len(vpos) - 1) ]
            if len(vpos):
                last = list(vpos.pop())
                last[1] = len(inv_page)
                vpos.append(tuple(last))
            verses = [ inv_page[tup[0]:tup[1]][::-1] for tup in vpos ][::-1]
            if not verses:
                verses = []
            data.append(verses)
        self.text = data

    def extend(self, tup, offset):
        left = tup[0]
        right = tup[1]
        diff = right - left
        plus = offset * diff
        new_left = left - plus
        new_right = right + plus
        if new_left < 0.0:
            new_left = 0.0
        if new_right > 1.0:
            new_right = 1.0
        return (new_left, new_right)

    def make_window(self, offset=0.5):
        self.window = []
        for page in self.text:
            sizes = list(accumulate([len(verse) for verse in page]))
            try:
                sizes = [ x/sizes[-1] for x in sizes ]
            except ZeroDivisionError as e:
                sizes = [ x for x in sizes ]
            sizes = [0.0] + [ x for y in list(zip(sizes,sizes)) for x in y ]
            sizes = [(sizes[i], sizes[i+1]) for i in range(0,len(sizes) - 1, 2)]
            sizes = [ self.extend(tup, offset) for tup in sizes ]
            self.window.append(sizes)

    @debug
    def romanize(self):
        print(self.text)
        self.roman = []
        for item in self.text:
            tmp = []
            for verse in item:
                if not verse:
                    tmp.append(verse)
                else:
                    tmp.append(itt.to_itrans(verse, config['itrans_language']))
            self.roman.append(tmp)

class Transform(Parser, Fetcher):

    def __init__(self, sample=None, images=None, pages=None):
        self.images = images
        self.pages = pages
        self.sample = sample
        self.noborder = []
        self.cropped = []
        super().fetch_links()

    @debug
    def build(self):
        if self.sample:
            selected_links = [ self.links[i] for i in self.sample ]
            self.links = selected_links
        else:
            self.sample = [i for i in range(0,len(self.links))]
        if not self.images:
            super().fetch_images()
        if not self.pages:
            pages = [ pytesseract.image_to_string( \
                                                  x, \
                                                  lang=config['tesseract_language'], \
                                                  config=config['tesseract_parameters'] \
                                                  ) \
                     for x in self.images ]
        super().__init__(pages=pages)

    def crop_border(self, im):
        # fraxel https://stackoverflow.com/users/1175101/fraxel
        # https://stackoverflow.com/a/10616717/4882300
        bg = Image.new(im.mode, im.size, im.getpixel((0,0)) )
        diff = ImageChops.difference(im, bg)
        diff = ImageChops.add(diff, diff, 2.0, -100)
        bbox = diff.getbbox()
        if bbox:
            return im.crop(bbox)

    @debug
    def crop_all_border(self):
        self.noborder = [ self.crop_border(x) for x in self.images ]

    def process(self, image, labels):
        if not image:
            return [image]
        images = []
        for tup in labels:
            begin = tup[0]
            end = 1.0 - tup[1]
            width, height = image.size
            begin *= height
            end *= height
            begin = int(begin)
            end = int(end)
            border = (0, begin, 0, end)
            result = ImageOps.crop(image, border)
            images.append(result)
        return images

    @debug
    def crop(self):
        super().split()
        super().make_window()
        window = self.window
        if len(self.images) != len(self.window):
            logger.debug(str(len(self.images)))
            logger.debug(str(len(self.window)))
        self.crop_all_border()
        self.cropped = [ self.process(self.noborder[i], v ) for i,v in enumerate(self.window) ]
        if not self.cropped:
            self.cropped = [ [x] for x in self.images]

class Save(Transform):

    def __init__(self, sample=None, images=None, pages=None):
        super().__init__(sample=sample, images=images, pages=pages)
        self.s3 = boto3.resource('s3')
        self.verse_json = []
        self.page_json = []

    @debug
    def run(self):
        self.build()
        self.crop()
        self.romanize()

    def upload(self, image, name):
        if not image:
            return
        image_bytes = io.BytesIO()
        image.save(image_bytes, config['pillow_save'])
        image_bytes.seek(0)
        self.s3.Bucket(config['bucket_name']).put_object(Key=name, Body=image_bytes, ACL=config['acl_policy'])

    def get_url(self, name):
        return "https://s3.amazonaws.com/" + config['bucket_name'] + "/" + name

    @debug
    def toJson(self):
        assert len(self.cropped) == len(self.images)
        for i,lst in enumerate(self.cropped):
            for j,verse in enumerate(lst):
                pagenum = self.sample[i]
                enum = j
                suffix = config['suffix_verse']
                imagetype_save = config['imagetype_save']
                name = "{0}_{1}_{2}.{3}".format(pagenum,enum,suffix,imagetype_save)
                self.upload(verse,name)
                try:
                    self.text[i][j]
                    self.roman[i][j]
                except:
                    continue
                self.verse_json.append({
                    "page" : pagenum,
                    "enum" : enum,
                    "san_text" : self.text[i][j],
                    "rom_text" : self.roman[i][j],
                    "link" : self.get_url(name)
                })

        for i,page in enumerate(self.images):
            pagenum = self.sample[i]
            link = self.links[i]
            self.page_json.append({
                "page" : pagenum,
                "link" : link,
            })

if __name__ == '__main__':
    # TO-DO ! make dir if not exists
    safe_run(os.chdir, "../../datasets/bharadwaj")
    s = Save()
    s.run()
    s.toJson()
    dump(s.verse_json, config['verse_json'])
    dump(s.page_json, config['page_json'])
