from bs4 import BeautifulSoup
from loguru import logger
import os
import pytesseract
import re
import requests
import yaml
import io
from cltk.corpus.sanskrit.itrans.unicode_transliterate import ItransTransliterator as itt
from PIL import Image, ImageChops, ImageOps
from itertools import accumulate

CONFIG_FILE = "config.yml"
config = yaml.load(open(CONFIG_FILE, "r"))
logger.add(config['logfile'])


def safe_run(function, *args):
    try:
        return function(*args)
    except Exception as e:
        logger.debug(e)
        os._exit(1)

class Fetcher(object):

    def __init__(self):
        self.links = []
        self.images = []

    def fetch_links(self):
        body = safe_run(requests.get, config['archive_url']).text
        soup = BeautifulSoup(body, 'lxml')
        self.links = [ re.sub( "//", "https://", link.get('href')) \
         for link in soup.findAll('a', \
                                  attrs={'href' : re.compile(".*jpg$") } \
                                  ) \
             ]

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
        for page in self.pages:
            inv_page = page[::-1]
            matches = pattern.finditer(inv_page)
            bar_positions = [ match.start() - 1 for match in matches ]
            assert len(bar_positions) % 2 == 0
            vpos = [ v for i,v in enumerate(bar_positions) if not i % 2 ]
            vpos = [ (vpos[i],vpos[i+1]-1) for i in range(len(vpos) - 1) ]
            last = list(vpos.pop())
            last[1] = len(inv_page)
            vpos.append(tuple(last))
            verses = [ inv_page[tup[0]:tup[1]][::-1] for tup in vpos ][::-1]
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
            sizes = [ x/sizes[-1] for x in sizes ]
            sizes = [0.0] + [ x for y in list(zip(sizes,sizes)) for x in y ]
            sizes = [(sizes[i], sizes[i+1]) for i in range(0,len(sizes) - 1, 2)]
            sizes = [ self.extend(tup, offset) for tup in sizes ]
            self.window.append(sizes)

    def romanize(self):
        self.roman = [[itt.to_itrans(x, config['itrans_language']) for x in y] for y in self.text]

class Transform(Parser, Fetcher):

    def __init__(self, sample=None, images=None, pages=None):
        self.images = images
        self.pages = pages
        self.sample = sample
        self.noborder = []
        self.cropped = []
        if not images:
            try:
                super().fetch_links()
            except Exception as e:
                logger.debug(e)

    def build(self):
        if self.sample:
            selected_links = [ self.links[i] for i in self.sample ]
            self.links = selected_links
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

    def crop_all_border(self):
        self.noborder = [ self.crop_border(x) for x in self.images ]

    def crop(self):
        super().split()
        super().make_window()
        window = self.window
        assert len(self.images) == len(self.window)
        self.crop_all_border()
        self.cropped = [ self.process(self.noborder[i], v ) for i,v in enumerate(self.window) ]

    def process(self, image, labels):
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

if __name__ == '__main__':
    # TO-DO ! make dir if not exists
    safe_run(os.chdir, "../../datasets/bharadwaj/scans")
    i = Transform(sample=[50])
    i.build()
    i.crop()
    i.cropped[0][0].show()
    i.cropped[0][1].show()
    i.cropped[0][2].show()
    i.cropped[0][3].show()
