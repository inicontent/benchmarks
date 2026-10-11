"""Recreate the storage figures: python src/figures.py results/latest"""
import json
import os
import statistics
import sys
import textwrap
from pathlib import Path
os.environ.setdefault('MPLCONFIGDIR', '/tmp/inicontent-benchmarks-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root = Path(sys.argv[1] if len(sys.argv)>1 else 'results/latest')
run = json.loads((root / 'results.json').read_text())
n=max(run['metadata']['sizes'])
profiles=run['metadata']['profiles']
fig, axes=plt.subplots(1,len(profiles),figsize=(9 if len(profiles)==1 else 6*len(profiles),7),squeeze=False)
for ax,profile in zip(axes[0],profiles):
    groups={}
    for r in run['results']:
        if r['rows']==n and r['profile']==profile:
            groups.setdefault(r['engine'],[]).append(r['stored']['allocated']/1048576)
    ordered=sorted(groups,key=lambda k:statistics.median(groups[k]))
    vals=[statistics.median(groups[k]) for k in ordered]
    colors=['#16a37a' if k=='inibase-gzip' else '#77bea9' if k.startswith('inibase') else '#6d7c95' for k in ordered]
    labels=[k.replace('inibase-gzip-patched','iniBase gzip + patch*').replace('inibase-gzip','iniBase gzip '+run['metadata']['dependencies']['inibase']).replace('inibase','iniBase plain') for k in ordered]
    bars=ax.barh(labels,vals,color=colors,height=.65)
    ax.invert_yaxis(); ax.set_xscale('log'); ax.set_xlabel('Allocated disk MiB • logarithmic scale')
    ax.set_title(profile.upper(),fontweight='bold',loc='left',pad=18)
    ax.grid(axis='x',alpha=.2); ax.set_axisbelow(True)
    for b,v in zip(bars,vals): ax.text(v*1.08,b.get_y()+b.get_height()/2,f'{v:.2f}',va='center',fontsize=9)
    ax.set_xlim(min(vals)*.7,max(vals)*2)
    for side in ['top','right']:ax.spines[side].set_visible(False)
fig.suptitle(f'Database storage at {n:,} records',fontsize=20,fontweight='bold',y=.99)
disclosure = "*Historical append patch; separately labeled from the published package." if "inibase-gzip-patched" in run["metadata"]["engines"] else f"Published iniBase {run['metadata']['dependencies']['inibase']}."
footer = f"Median of {run['metadata']['repeats']} trials, total allocated footprint after maintenance and close. Lower is better.\n{disclosure} Failed correctness runs excluded; all failures retained in report.\nSynthetic data on {run['metadata']['cpu']}. Dedicated server totals include fixed cluster overhead. No cloud-price or speed claim."
if len(profiles)==1:
    footer='\n'.join(textwrap.fill(line,115) for line in footer.splitlines())
fig.text(.01,.02,footer,fontsize=10,ha='left')
fig.tight_layout(rect=[0,.15,1,.94],w_pad=3)
fig.savefig(root/'storage.png',dpi=160,bbox_inches='tight')
fig.savefig(root/'storage.svg',bbox_inches='tight')

svg=root/'storage.svg'
svg.write_text('\n'.join(line.rstrip() for line in svg.read_text().splitlines())+'\n')
