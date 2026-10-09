def srgb(c):
    c=c/255
    return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def L(rgb):
    r,g,b=rgb
    return 0.2126*srgb(r)+0.7152*srgb(g)+0.0722*srgb(b)
def ratio(a,b):
    la,lb=L(a),L(b)
    hi,lo=max(la,lb),min(la,lb)
    return (hi+0.05)/(lo+0.05)
def hx(h):
    h=h.lstrip('#')
    if len(h)==3: h=''.join(c*2 for c in h)
    return tuple(int(h[i:i+2],16) for i in (0,2,4))
def over(fg,a,bg):
    return tuple(a*fg[i]+(1-a)*bg[i] for i in range(3))

tests=[
 ("L236 .note color #5f480c on --gold-s #f8efd9", hx('#5f480c'), hx('#f8efd9')),
 ("L897/1013 #5d6b80 on --panel #fff", hx('#5d6b80'), hx('#ffffff')),
 ("L898/1014 #a06a3c on --panel #fff", hx('#a06a3c'), hx('#ffffff')),
 ("L895 .pod.g1 .r --gold #83620f on --gold-s #f8efd9", hx('#83620f'), hx('#f8efd9')),
 ("L667 .proj p #a8b2c4 on #182238 (radial centre)", hx('#a8b2c4'), hx('#182238')),
 ("L673 .proj .code #7fd394 on #182238", hx('#7fd394'), hx('#182238')),
 ("L658 .proj color #eef1f6 on #182238", hx('#eef1f6'), hx('#182238')),
 ("L227 .btn-pri:hover #fff on #2f2f2f", hx('#ffffff'), hx('#2f2f2f')),
]
for name,fg,bg in tests:
    print(f"{ratio(fg,bg):6.2f}  {name}")

print()
# hero: composite backdrop = rgba(10,15,18,a) over base
base_cases = {
 "base grad #0d1418": hx('#0d1418'),
 "base grad #14201a": hx('#14201a'),
 "bridge deck #2b3744": hx('#2b3744'),
 "bridge deck top #46566a": hx('#46566a'),
 "pier highlight #7d8da0": hx('#7d8da0'),
}
overlay = (10,15,18)
for bname,b in base_cases.items():
    for a in (0.78, 0.94):
        comp = over(overlay, a, b)
        print(f"  backdrop {bname} + overlay a={a}: rgb({comp[0]:.0f},{comp[1]:.0f},{comp[2]:.0f})  (lum {L(comp):.4f})")
print()
# worst (lightest) plausible text backdrop
worst = over(overlay,0.78,hx('#46566a'))
typ   = over(overlay,0.86,hx('#14201a'))
for label,bg in (("lightest plausible (deck under .78 overlay)",worst),("typical (base under .86 overlay)",typ)):
    print(f"-- backdrop {label}: rgb({bg[0]:.0f},{bg[1]:.0f},{bg[2]:.0f})")
    for alpha,who in ((0.82,"L348 .kicker rgba(255,255,255,.82) @ .8rem"),
                      (0.78,"L372 .hero h1 .l1 rgba(255,255,255,.78) display"),
                      (0.70,"L424 .meta div rgba(255,255,255,.7) @ .88rem"),
                      (0.62,"L441 .cd .u span rgba(255,255,255,.62) @ .64rem"),
                      (0.34,"L404 .pillars-line i rgba(255,255,255,.34)")):
        fg = over((255,255,255),alpha,bg)
        print(f"   {ratio(fg,bg):6.2f}  {who}")
print()
# hero accent tokens on hero bg for reference
for name,c in (("--gold-hi #d8ab52 (.theme)",'#d8ab52'),("--clay-hi #dd9365",'#dd9365'),
               ("--brand-hi #5cc274",'#5cc274'),("--cyan-hi #58c3dd",'#58c3dd')):
    print(f"  {ratio(hx(c),typ):6.2f}  {name} on typical hero backdrop")
