from bs4 import BeautifulSoup
from loguru import logger
import os
import pytesseract
import re
import requests
import yaml
import io
from PIL import Image, ImageChops

CONFIG_FILE = "config.yml"
config = yaml.load(open(CONFIG_FILE, "r"))
logger.add(config['logfile'])

def trim(im):
    # fraxel https://stackoverflow.com/users/1175101/fraxel
    # https://stackoverflow.com/a/10616717/4882300
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)) )
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)

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

def split_verses(text):
    data = []
    pattern = re.compile("(?<=[(॥)?])\s*")
    for page in text:
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
    return data

if __name__ == '__main__':
    f = Fetcher()
    f.fetch_links()
    f.links = [f.links[50]]
    links = f.links
    f.fetch_images()
    images = f.images
    # TO-DO ! make dir if not exists
    safe_run(os.chdir, "../datasets/bharadwaj/scans")
    trimmed_images = [ trim(x) for x in images ]
    #trimmed_images[0].show()
    pages = [ pytesseract.image_to_string(x, lang=config['tesseract_language'], \
                                         config=config['tesseract_parameters']) for x in images ]
    verses = split_verses(pages)
