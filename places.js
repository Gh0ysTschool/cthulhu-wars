const place = (name='',adjacent=[],ocean=false,gate=0) => ({name,adjacent,ocean,gate,renderGate:f=>{}})
const 
    arcticocean = place('arcticocean',['northamerica','northatlantic','northpacific','scandinavia','northasia'],true),
    northpacific = place('northpacific',['arcticocean','northamerica','southamerica','indianocean','southpacific','northasia','southasia']),
    northamerica = place('northamerica',['southamerica','northatlantic','accrticocean','northpacific']),
    northatlantic = place('northatlantic',['southamerica','northamerica','southatlantic','northpacific','arcticocean','europe','westafrica','arabia','scandinavia'],true),
    scandinavia = place('scandinavia',['arcticocean','northatlantic','europe','northasia']),
    europe = place('europe',['northatlantic','arabia','northasia','scandinavia']),
    northasia = place('northasia',['arcticocean','scandinavia','europe','arabia','southasia','northpacific']),
    arabia = place('arabia',['eastafrica','westafrica','europe','southasia','indianocean','northasia','northatlantic']),
    southasia = place('southasia',['arabia','northasia','northpacific','indianocean']),
    southamerica = place('southamerica',['northpacific','southpacific','northatlantic','southatlantic','northamerica']),
    westafrica = place('westafrica',['eastafrica','southatlantic','northatlantic','arabia','indianocean']),
    indianocean = place('indianocean',['northpacific','southasia','arabia','eastafrica','westafrica','antarctica','southatlantic','southpacific'],true),
    southpacific = place('southpacific',['australia','indianocean','northpacific','antarctica','southamerica','southatlantic'],true),
    southatlantic = place('southatlantic',['southpacific','southamerica','northatlantic','antarctica','eastafrica','westafrica'],true),
    eastafrica = place('eastafrica',['southatlantic','westafrica','arabia','indianocean']),
    australia = place('australia',['indianocean','southpacific']),
    antarctica = place('antarctica',['indianocean','southatlantic','southpacific'])
    const places = {arcticocean, northpacific, northamerica, northatlantic, scandinavia, europe, northasia, southamerica, southasia, arabia, westafrica, indianocean, eastafrica, antarctica, southatlantic, southpacific, australia}
    export default places