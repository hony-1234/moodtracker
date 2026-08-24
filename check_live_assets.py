import sys
import urllib.request
import urllib.parse

sys.stdout.reconfigure(encoding='utf-8')

base_url = "https://moodtracker-app-d6b42.web.app"
assets = [
    "/學校圖檔/吉祥物/xinxin_body_base.png",
    "/學校圖檔/吉祥物/xinxin_fire.png",
    "/學校圖檔/吉祥物/xinxin_left_eye.png",
    "/學校圖檔/吉祥物/xinxin_left_hand.png",
    "/學校圖檔/吉祥物/xinxin_legs.png",
    "/學校圖檔/吉祥物/xinxin_right_eye.png",
    "/學校圖檔/吉祥物/xinxin_right_hand.png"
]

for asset in assets:
    encoded_path = urllib.parse.quote(asset)
    url = base_url + encoded_path
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req) as resp:
            print(f"Asset URL: {url} | Status: {resp.status}")
    except Exception as e:
        print(f"Asset URL: {url} | Error: {e}")
