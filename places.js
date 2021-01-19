const place = (name='',adjacent=[],ocean=false,glyphs=[],gate=0) => ({glyphs,name,adjacent,ocean,gate,renderGate:f=>{}})
const 
    arcticocean = place('arcticocean',['northamerica','northatlantic','northpacific','scandinavia','northasia'],true),
    northpacific = place('northpacific',['arcticocean','northamerica','southamerica','indianocean','southpacific','northasia','southasia']),
    northamerica = place('northamerica',['southamerica','northatlantic','accrticocean','northpacific'],false,['\\o/']),
    northatlantic = place('northatlantic',['southamerica','northamerica','southatlantic','northpacific','arcticocean','europe','westafrica','arabia','scandinavia'],true),
    scandinavia = place('scandinavia',['arcticocean','northatlantic','europe','northasia'],false,['\\|/']),
    europe = place('europe',['northatlantic','arabia','northasia','scandinavia'],false,['\\|/']),
    northasia = place('northasia',['arcticocean','scandinavia','europe','arabia','southasia','northpacific'],false,['\\|/']),
    arabia = place('arabia',['eastafrica','westafrica','europe','southasia','indianocean','northasia','northatlantic'],false,['\\|/']),
    southasia = place('southasia',['arabia','northasia','northpacific','indianocean'],false,['\\|/']),
    southamerica = place('southamerica',['northpacific','southpacific','northatlantic','southatlantic','northamerica'],false,['\\o/']),
    westafrica = place('westafrica',['eastafrica','southatlantic','northatlantic','arabia','indianocean'],false,['\\-/']),
    indianocean = place('indianocean',['northpacific','southasia','arabia','eastafrica','westafrica','antarctica','southatlantic','southpacific'],true),
    southpacific = place('southpacific',['australia','indianocean','northpacific','antarctica','southamerica','southatlantic'],true),
    southatlantic = place('southatlantic',['southpacific','southamerica','northatlantic','antarctica','eastafrica','westafrica'],true),
    eastafrica = place('eastafrica',['southatlantic','westafrica','arabia','indianocean'],false,['\\-/']),
    australia = place('australia',['indianocean','southpacific'],false,['\\-/']),
    antarctica = place('antarctica',['indianocean','southatlantic','southpacific'])
    const places = {arcticocean, northpacific, northamerica, northatlantic, scandinavia, europe, northasia, southamerica, southasia, arabia, westafrica, indianocean, eastafrica, antarctica, southatlantic, southpacific, australia}
    export default places