const COLORS = ["#ECA843", "#EEA05D", "#EA723D", "#EAA35F", "#E98158", "#E97F58", "#E76D53", "#E66D5F", "#E56B79", "#E16490", "#E481AE", "#E68199", "#DC5E9A", "#E16CB5", "#D25FAC", "#D263AE", "#D66CB4", "#D071B6", "#BA82BE", "#AF71B5", "#A96BB2", "#905FAA", "#B38BC2", "#9D78B8", "#8D7AB8", "#7F68AE", "#9F99C8", "#717DC6", "#5E7DCC", "#5A90C0", "#628DCC", "#7994D0", "#81A1CA", "#ADD2DE", "#80BDD3", "#83C5D6", "#8BC8CB", "#91CBC6", "#83C3BB", "#7DBFB2", "#AAD6C2", "#84C194", "#B3DBB4", "#92C896", "#94C994", "#9FCE8E", "#A6D293", "#ABD373", "#BFDE73", "#CCE57D"]

/*
if (null !== (n = e.title) && void 0 !== n && n.color && e.title.color.length > 0)
  return e.title.color;
for (var r = e.userIdHash, i = 0, o = 0; o < r.length; o++)
  i += r.charCodeAt(o);
for (var a = 0; a < t.length; a++) // cid
  i += t.charCodeAt(a);
return xu[i % xu.length]
*/

export default function getColor(profile, cid) {
  if(profile?.title?.color)
    return profile.title.color

  let sum = 0

  if(profile?.userIdHash)
    for(let i = 0; i < profile.userIdHash.length; i++)
      sum += profile.userIdHash.charCodeAt(i)

  if(cid)
    for(let i = 0; i < cid?.length; i++)
      sum += cid.charCodeAt?.(i)

  return COLORS[sum % COLORS.length]
}
