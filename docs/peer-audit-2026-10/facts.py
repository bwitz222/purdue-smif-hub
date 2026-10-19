import json, os, statistics as st, re
from collections import defaultdict
O=os.path.join(os.path.dirname(os.path.abspath(__file__)),'data')+'/'
sites=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'sites.json'))); S={s['id']:s for s in sites}
rows=[json.loads(l) for l in open(O+'merged.jsonl')]
struct={(r['site'],r['kind']):r for r in map(json.loads,open(O+'structure_merged.jsonl'))}
P=defaultdict(dict)
for r in rows: P[(r['site'],r['kind'])][r['mode']]=r
# Hand-coded from desktop fold screenshots (top-level section links in the main bar; excludes logo, Home, search, login, region, utility row, CTA pill).
NAV={ 'smif':(8,False,'Apply pill'),
 'gs':(4,True,''),'ms':(4,True,''),'jpm':(4,True,''),'bofa':(4,True,''),'citi':(7,False,''),'barc':(6,True,''),'ubs':(6,True,''),'db':(6,True,'three stacked rows'),'evr':(0,False,'hamburger only on desktop'),'laz':(6,False,''),
 'blk':(6,True,''),'vgd':(4,True,'Subscribe pill'),'fid':(5,True,'Open an account pill'),'pimco':(3,True,'audience modal'),'bkf':(4,True,''),'apo':(5,True,''),'wel':(5,True,'My Account pill'),'cap':(0,False,'audience gateway, no nav'),'trow':(4,True,'Log In pill'),'bain':(6,True,''),
 'bw':(6,True,''),'oak':(4,True,''),'aqr':(3,True,''),'ts':(3,True,''),'des':(3,True,''),'kkr':(0,False,'hamburger only on desktop'),
 'nlf':(4,False,''),'mii':(3,False,'Apply pill'),'fsmif':(3,False,''),'shf':(4,False,''),'tsmf':(7,False,'')}
# Hero leads with a specific, current piece of research/commentary/outlook (from fold screenshots + H1).
CONTENT_HERO={'gs','ms','jpm','bofa','barc','ubs','db','laz','blk','pimco','wel','bw','aqr'}
TOP20=[s['id'] for s in sites if s['group'] in('Sell-side','Buy-side')]
def grp(i): g=S[i]['group']; return 'Buy-side' if g.startswith('Buy') else g
def home(i,m='desktop'): return P[(i,'home')][m]
def subscribes(i):
    st_=struct.get((i,'home'),{})
    return home(i)['hasSubscribe'] or any(re.search(r'subscribe|newsletter|stay informed|straight to your',h,re.I) for h in st_.get('hs',[]))
F={}
for i in S:
    d,m=home(i),home(i,'mobile')
    F[i]=dict(name=S[i]['name'],group=S[i]['group'],primaryNav=NAV[i][0],utilitySplit=NAV[i][1],navNote=NAV[i][2],
      contentHero=i in CONTENT_HERO,search=d['hasSearch'],subscribe=subscribes(i),cookieDesk=d['cookieCover'],cookieMob=m['cookieCover'],
      video=d['heroVideo']>0,homeKB=round(d['bytes']/1024),homeReqs=d['reqs'],homeLCP=d['lcp'],homeAxe=d['axeSerious'],small=d['small'],
      mTargets=m['targetsAdj'],mHeight=m['height'],h1font=(d.get('h1') or {}).get('font'),insightLinks=d['insightLinks'])
json.dump(F,open(O+'features.json','w'),indent=1)
def cnt(key,ids,fn=bool): return sum(1 for i in ids if fn(F[i][key]))
pn=[F[i]['primaryNav'] for i in TOP20 if F[i]['primaryNav']>0]
print('top20 primary nav median',st.median(pn),'n',len(pn),'range',min(pn),max(pn), 'utility split',cnt('utilitySplit',TOP20),'/20')
print('content hero', cnt('contentHero',TOP20),'/20', sorted(i for i in TOP20 if F[i]['contentHero']))
print('search',cnt('search',TOP20),'subscribe',cnt('subscribe',TOP20),'cookie>0 desk',cnt('cookieDesk',TOP20,lambda x:x>0),'cookie>=25% mobile',cnt('cookieMob',TOP20,lambda x:x>=0.25),'video',cnt('video',TOP20))
print('cookie mobile median (those with banner)',st.median([F[i]['cookieMob'] for i in TOP20 if F[i]['cookieMob']>0]))
print('subscribe list',[i for i in TOP20 if F[i]['subscribe']]); print('no search',[i for i in TOP20 if not F[i]['search']])
print('small>0 top20',[ (i,F[i]['small']) for i in TOP20 if F[i]['small']>0])
# all-pages small text by site
for i in S:
    sm=[P[k]['desktop']['small'] for k in P if k[0]==i]
    if i=='smif' or max(sm)>0: print('small',i,sm)
