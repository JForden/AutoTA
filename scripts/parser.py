import json

def main():
    f=open("agebhard.out")
    data=json.load(f)
    result=data["result"]
    for Tsuit in result:
        print(Tsuit)

    

if __name__ == "__main__":
    main()