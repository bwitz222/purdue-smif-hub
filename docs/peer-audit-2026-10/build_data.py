import json, os, statistics as st
from collections import defaultdict
O=os.path.join(os.path.dirname(os.path.abspath(__file__)),'data')+'/'
sites=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'sites.json'))); S={s['id']:s for s in sites}
pages=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'pages.json')))
rows=[json.loads(l) for l in open(O+'merged.jsonl')]
F=json.load(open(O+'features.json'))
F['gs']['search']=True  # icon-only search button visible in GS header screenshot; label-less so the DOM check missed it
P=defaultdict(dict)
for r in rows: P[(r['site'],r['kind'])][r['mode']]=r
GROUPS={'Ours':['smif'],'Top-20':[i for i in S if S[i]['group'] in('Sell-side','Buy-side')],
 'Sell-side 10':[i for i in S if S[i]['group']=='Sell-side'],'Buy-side 10':[i for i in S if S[i]['group']=='Buy-side'],
 'Prior buy-side 6':[i for i in S if S[i]['group']=='Buy-side (prior set)'],'Student funds 5':[i for i in S if S[i]['group']=='Student fund']}
M=[('Page weight, desktop (KB)',lambda d,m:d['bytes']/1024,0),('Requests, desktop',lambda d,m:d['reqs'],0),
   ('LCP, desktop (ms)',lambda d,m:d['lcp'] or None,0),('LCP, mobile (ms)',lambda d,m:m['lcp'] or None,0),
   ('Serious/critical axe nodes',lambda d,m:d['axeSerious'],1),('Text elements under 12px',lambda d,m:d['small'],0),
   ('Mobile targets under 24px',lambda d,m:m['targetsAdj'],0),('Mobile page height (px)',lambda d,m:m['height'],0)]
def score(kinds=None):
    out={}
    for g,ids in GROUPS.items():
        out[g]={}
        for name,f,_ in M:
            xs=[]
            for (i,k),v in P.items():
                if i in ids and (not kinds or k in kinds):
                    x=f(v['desktop'],v['mobile'])
                    if x is not None: xs.append(x)
            out[g][name]=round(st.median(xs)) if xs else None
            out[g]['_n']=len([1 for (i,k) in P if i in ids and (not kinds or k in kinds)])
    return out
ours=[]
for k in ['home','about','team','research','holdings','performance','sectors','recruiting','apply','learn','contact']:
    d,m=P[('smif',k)]['desktop'],P[('smif',k)]['mobile']
    ours.append(dict(page='/' if k=='home' else '/'+k,kb=round(d['bytes']/1024),lcp=d['lcp'],axe=d['axeSerious'],small=d['small'],mt=m['targetsAdj'],mh=m['height'],dark=d['heroDark']))
data=dict(scoreAll=score(),scoreHome=score({'home'}),scoreTeam=score({'team'}),scoreResearch=score({'research'}),features=F,ours=ours,
  sites=[dict(id=s['id'],name=s['name'],group=s['group'],url=s['url'],pages=list(pages[s['id']].keys())) for s in sites],
  totals=dict(sites=len(sites),pages=sum(len(v) for v in pages.values()),captures=len(rows)))
json.dump(data,open(O+'data.json','w'),indent=1)
for k in ['scoreAll','scoreHome','scoreTeam','scoreResearch']:
    print(k); 
    for name,_,_ in M: print('  ',name.ljust(30),[data[k][g][name] for g in GROUPS])
    print('   n',[data[k][g]['_n'] for g in GROUPS])
print(data['totals'])
