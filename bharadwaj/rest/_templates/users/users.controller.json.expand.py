import json
from collections import defaultdict
filename = "./_templates/users/users.controller.json"
final_filename = "./_templates/users/users.controller.final.json"

with open(filename,'r') as f:
    data = json.load(f)

expanded_data = defaultdict(list)

for outer_key in data.keys():
    for inner_key in data[outer_key].keys():
        expanded_key = inner_key + "_list"
        expanded_data[expanded_key].extend(data[outer_key][inner_key])

data.update(expanded_data)

with open(final_filename, 'w+') as f:
        json.dump(data, f, indent=4, sort_keys=True)
        