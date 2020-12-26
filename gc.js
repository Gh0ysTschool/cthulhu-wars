let G
let phs
let faction = (g,p) => {
    G = g;
    phs = p
    let oceans = Object.keys(G.places).filter( p => G.places[p].oceans)
    let books = ["Absorb", "Devolve", "Dreams", "Regenerate", "Submerge", "Y'hn Nthlei"]
    let bookinit = {
        "Absorb":f=>{},
        "Devolve":f=>{},
        "Dreams":f=>{},
        "Regenerate":f=>{},
        "Submerge":f=>{},
        "Y'hn Nthlei":f=>{}
    }
            
    let bookreqs = [
        {'1st doom + sign':f=>G.phase=='doom' },
        {'kill/devour enemy':f=> G.choices.fight.enemy?.kills+G.choices.fight.enemy?.devour == 1 || G.choices.fight.enemy?.kills+G.choices.fight.enemy?.devour == 3  },
        {'kill/devour 2 enemies':f=> G.choices.fight.enemy?.kills+G.choices.fight.enemy?.devour == 2 || G.choices.fight.enemy?.kills+G.choices.fight.enemy?.devour == 3 },
        {'3/4 Ocean Gates':f=> G.player.units.filter( u => u.gate && oceans.includes( u.place )).length > 2 || Object.values(G.places).filter( p => p.ocean && p.gate ).length > 3 },
        {'Awaken Cthulhu':f=> G.choices.awaken.unit?.type=='goo'},
        {'doom + 5 books + sign':f=> G.phase == 'doom' && G.player.books.length == 5}
    ]
    let goo = 'Cthulhu'
    let mons = {'Deep One':4,Shoggoth:2,Starspawn:2}
    let color = 'green'
    let start = 'southpacific'
    let name = 'gc'
    let units = []
    let addUnit = (u,p) => {
        u.owner = p
        p.units = [...p.units,u]
    }
    let cost = 10
    let awakencthu = {
        awakenplaces: () => [G.player.faction.start],
        awakenreq: () => G.player.power > 9 && G.places[G.player.faction.start].gate,
        cost: () => { G.player.power-=cost; cost = 4; G.player.signs++; phs.endStage(); },
    }
    let initUnits = p => {
        p.units = [
            ...p.units,
            {...G.unit("Great Cthulhu",p,'',10,6,2),...awakencthu},
            ...[0,1,2,3].map( f=> G.unit('Deep One',p,'',1,1,1)),
            ...[0,1].map( f=> G.unit('Shoggoth',p,'',2,2,1)),
            ...[0,1].map( f=> G.unit('Starspawn',p,'',3,3,1,1)),
        ]
    }
    let faction = {bookinit,books,bookreqs,goo,mons,color,start,name,units,addUnit,initUnits}
    
    return faction
}

let emerge = () => {}
//req:gc & gc.submerged
//place
let submerge = () => {}
//req:gc & gc in ocean, 1pow, !gc.submerged
//unit(s)
let dream = () => {}
//req:cult in pool, enemy cults
//place
//faction
//(faction) unit
let devolve = () => {}
//req:cult in area && deepone in pool
//interupt on phase start and unit is capturable
let devour = () => {}
let yhanthlei = () => {}
let regenerate = () => {}
let absorb = () => {}
export default faction