import xml.etree.ElementTree as ET
import sys


# Open original file
et = ET.parse('pics/on-fire-type.svg')
root = et.getroot()
# et.strip_attrbutes(element,'attribute_name'))
et.write("trial.svg")