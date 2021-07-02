def check_valid_json():
    pass


def get_value_or_empty(dictionary, key):
    if key in dictionary:
        return dictionary[key]
    return ""
