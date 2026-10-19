import json, os, sys
from PIL import Image, ImageDraw, ImageFont
S=os.path.join(os.path.dirname(os.path.abspath(__file__)),'data','shots')+'/'
sites=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'sites.json')))
def font(sz):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p,sz)
    return ImageFont.load_default()
def sheet(ids, mode, out, cols, tw):
    ims=[]
    for sid in ids:
        f=f'{S}{sid}_home_{mode}_fold.jpg'
        if not os.path.exists(f): continue
        name=next(s['name'] for s in sites if s['id']==sid)
        im=Image.open(f).convert('RGB'); im.thumbnail((tw,10000)); ims.append((name,im))
    th=max(i.height for _,i in ims); lab=34; pad=14
    rows=(len(ims)+cols-1)//cols
    W=cols*tw+(cols+1)*pad; H=rows*(th+lab)+(rows+1)*pad
    c=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(c); F=font(18)
    for n,(name,im) in enumerate(ims):
        x=pad+(n%cols)*(tw+pad); y=pad+(n//cols)*(th+lab+pad)
        d.text((x,y+6),name,fill=(20,20,20),font=F); c.paste(im,(x,y+lab)); d.rectangle([x,y+lab,x+im.width-1,y+lab+im.height-1],outline=(200,200,200))
    c.save(out,quality=82); print(out,c.size,len(ims))
if __name__=='__main__':
    o=os.path.join(os.path.dirname(os.path.abspath(__file__)),'data')+'/'
    sell=['smif']+[s['id'] for s in sites if s['group']=='Sell-side']
    buy=[s['id'] for s in sites if s['group']=='Buy-side']
    sheet(sell,'desktop',o+'sheet_sell.jpg',4,480)
    sheet(buy+['nlf','shf'],'desktop',o+'sheet_buy.jpg',4,480)
    sheet(['smif','gs','ms','jpm','citi','ubs','vgd','fid','wel','bain','nlf','shf'],'mobile',o+'sheet_mobile.jpg',6,260)
