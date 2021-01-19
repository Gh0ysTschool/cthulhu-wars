
let G, phs, H
let faction = (g,p,h) => {
    G = g
    phs = p
    H = h
    let oceans = Object.keys(G.places).filter( p => G.places[p].oceans)
    let books = ["Absorb", "Devolve", "Dreams", "Regenerate", "Submerge", "Y'hn Nthlei"]
    let bookinit = {
        "Absorb":absorb,
        "Devolve":devolve,
        "Dreams":dream,
        "Regenerate":regenerate,
        "Submerge":()=>{submerge();emerge();},
        "Y'hn Nthlei":yhanthlei
    }
    H["Absorb"]=absorb
    H["Devolve"]=devolve
    H["Dreams"]=dream
    H["Regenerate"]=regenerate
    H["Submerge"]=()=>{submerge();emerge();}
    H["Y'hn Nthlei"]=yhanthlei
            
    let bookreqs = [
        {'1st doom + sign':f=>G.phase=='doom' },
        {'kill/devour enemy':f=> G.choices.fight.enemy?.temp.phase.kills+G.choices.fight.enemy?.temp.phase.devour == 1 || G.choices.fight.enemy?.temp.phase.kills+G.choices.fight.enemy?.temp.phase.devour == 3  },
        {'kill/devour 2 enemies':f=> G.choices.fight.enemy?.temp.phase.kills+G.choices.fight.enemy?.temp.phase.devour == 2 || G.choices.fight.enemy?.temp.phase.kills+G.choices.fight.enemy?.temp.phase.devour == 3 },
        {'3/4 Ocean Gates':f=> G.player.units.filter( u => u.gate && oceans.includes( u.place )).length > 2 || Object.values(G.places).filter( p => p.ocean && p.gate ).length > 3 },
        {'Awaken Cthulhu':f=> G.choices.awaken.unit?.type=='Great Cthulhu'},
        {'doom + 5 books + sign':f=> G.phase == 'doom' && G.player.books.length == 5}
    ]
    H['1st doom + sign']=f=>G.phase=='doom' 
    H['kill/devour enemy']=f=> G.choices.fight.enemy?.temp.phase.kills+G.choices.fight.enemy?.temp.phase.devour == 1 || G.choices.fight.enemy?.temp.phase.kills+G.choices.fight.enemy?.temp.phase.devour == 3 
    H['kill/devour 2 enemies']=f=> G.choices.fight.enemy?.temp.phase.kills+G.choices.fight.enemy?.temp.phase.devour == 2 || G.choices.fight.enemy?.temp.phase.kills+G.choices.fight.enemy?.temp.phase.devour == 3 
    H['3/4 Ocean Gates']=f=> G.player.units.filter( u => u.gate && oceans.includes( u.place )).length > 2 || Object.values(G.places).filter( p => p.ocean && p.gate ).length > 3 
    H['Awaken Cthulhu']=f=> G.choices.awaken.unit?.type=='Great Cthulhu'
    H['doom + 5 books + sign']=f=> G.phase == 'doom' && G.player.books.length == 5

    let color = 'green'
    let start = 'southpacific'
    let name = 'gc'
    let units = []
    let cost = 10
    let awakencthu = {
        awakenplaces: () => [G.player.faction.start],
        awakenreq: () => G.player.power > 9 && G.places[G.player.faction.start].gate,
        cost: () => { G.player.power-=cost; cost = 4; G.player.signs++; phs.endStage(); },
    }
    H['Great Cthulhu']=awakencthu
    let initUnits = p => {
        p.units = [
            ...p.units,
            {...G.unit("Great Cthulhu",name,'',10,6,2),...awakencthu},
            ...[0,1,2,3].map( f=> G.unit('Deep One',name,'',1,1,1)),
            ...[0,1].map( f=> G.unit('Shoggoth',name,'',2,2,1)),
            ...[0,1].map( f=> G.unit('Starspawn',name,'',3,3,1,1)),
        ]
    }
    devour()
    immortal()
    return {bookinit,books,bookreqs,color,start,name,units,initUnits}   
}

let lim = 1, unlim = 1, req = f => true, init = f => {}

let emerge = () => phs.addPhase( 'emerge',{
    lim,
    start : 'place',
    req: f => G.player.units.find( u => u.type == 'Great Cthulhu').place == 'submerged',
    stages: {               
        place : {
            options : f => Object.keys(G.places),
            moves : {
                choose : (np, c) => {
                    if ((np == 'place' || np == 'emerge') && Object.keys(G.places).includes(c)) {
                        G.player.units.filter( u => u.place == 'submerged').map( u => u.place = c)
                        phs.endStage()
                    }
                }
            }
        }
    }
})
let submerge = () => phs.addPhase('submerge', {
    lim,
    start : 'unit',
    req: f => G.player.units.find( u => u.type == 'Great Cthulhu' && G.places[u.place] ),
    stages: {               
        unit : {
            options : f => G.player.units.filter( u => u.place = G.player.units.find( u => u.type == 'Greath Cthulhu').place ),
            moves : {
                choose : (np, c) => {
                    if ((np == 'unit' || np == 'submerge') && G.player.units.filter( u => u.place = G.player.units.find( u => u.type == 'Greath Cthulhu').place ).includes(c)) {
                        c.place = 'submerged'
                        G.forceRerender()
                    }
                },
                done : f => {
                    G.player.units.find( u => u.type == 'Greath Cthulhu').place = 'submerged'
                    G.player.power--;
                    phs.endStage()
                }
            },
        }
    }
})
let dream = () => phs.addPhase('dream', {
    lim,
    start : 'place',
    req: f => G.player.power > 1 && G.player.units.filter( u => u.type == 'cult' && u.place == '' ).length && G.units.filter( u => u.type == 'cult' && G.places[u.place] && H.findPly(u.owner).faction.name != 'gc' ).length,
    stages: {               
        place : {
            next : 'player',
            options : f => Object.keys(G.places).filter( p => G.units.find( u => u.type == cult && H.findPly(u.owner).faction.name != 'gc' ) ),
            moves : {
                choose : (np, c) => {
                    if ((np == 'place' || np == 'dream') && Object.keys(G.places).filter( p => G.units.find( u => u.type == cult && H.findPly(u.owner).faction != 'gc' ) ).includes(c)) {
                        G.choices.dream.places = c
                        phs.endStage()
                    }
                }
            },
        },         
        player : {
            next:'util',
            options : f => G.players.filter( p => p.units.find( u => u.place == G.choices.dream.place ) && p.faction.name != 'gc'),//.map( p => p.faction.name ),
            moves : {
                choose : (np, c) => {
                    if (np == 'player' && G.players.filter( p => p.units.find( u => u.place == G.choices.dream.place ) && p.faction.name != 'gc').includes(c)) {
                        G.choices.dream.player = c
                        phs.endStage()
                    }
                }
            },
        },
        util : {
            options : f => [],
            init : f => {phs.interuptStage('dream','unit',G.players.indexOf(G.choices.dream.player))},
            moves : {
                choose : (np,c) => {},
                done : (np, c) => phs.endStage()
            },
        },
        unit : {
            options : f => G.player.units.filter( u => u.type == 'cult' && u.place == G.choices.dream.place ),
            moves : {
                choose : (np, c) => {
                    if ((np == 'unit' || np == 'dream') && G.player.units.filter( u => u.type == 'cult' && u.place == G.choices.dream.place ).includes(c)) {
                        G.choices.dream.unit = c
                        c.place = ''
                        G.players.find( p => p.faction.name='gc').units.find( u => u.type == 'cult' && u.place == '' ).place = G.choices.dreams.place
                        phs.returnStage()
                    }
                }
            },
        },
    }
})
let devolve = () => {
    G.choices.devolve = {unit:null}
    let dvstage = {
        unit : {
            options: f => G.player.units.filter( u => u.type=='cult' && G.places[u.place]),
            moves : {
                choose : (np,c) => {
                    if ((np != 'unit' && np != 'devolveunit' ) || !G.player.units.filter( u => u.type=='cult' && G.places[u.place]).includes(c)) return
                    G.choices.devolve.unit = c
                    G.player.units.find( u => u.type=='Deep One' && u.place=='' ).place = c.place
                    c.place = ''
                    c.gate = 0
                    if (!G.player.units.find( u => u.type=='Deep One' && u.place=='' )) phs.endStage()
                    G.forceRerender()
                },
                done : (np,c) => phs.endStage(),
            }
        }
    }
    phs.addPhase('devolve',{
        start : 'unit',
        unlim,
        req: f => G.player.faction.name=='gc' && G.player.units.find( u => u.type=='cult' && G.places[u.place]) && G.player.units.find( u => u.type=='Deep One' && u.place=='' ),
        stages: {
            unit : {...dvstage.unit}
        }
    })
    dvstage.unit.init = f => { 
        if (G.player.faction.name != 'gc' 
            && G.units.find( u => 
            H.findPly(u.owner).faction.name != 'gc' 
            && (u.combat || u.tier)
            && G.players.find( p => p.faction.name=='gc' ).units.filter( u => !u.tier).map(u => u.place).includes(u.place)) )
                phs.interuptStage('action','devolveunit',G.players.indexOf(G.players.find( p => p.faction.name=='gc')))
        else phs.endStage()
    }
    dvstage.unit.moves.done = f => {phs.returnStage();phs.endStage();}
    dvstage.unit.next = ''+G.phases.action.start||''
    G.phases.action.start = 'devolveunit'
    G.phases.action.stages['devolveunit'] = dvstage.unit

}
let devoured
let devour = () => {
    let dvstage = {
        init : f => { 
            devoured = ([G.choices.fight.player, G.choices.fight.enemy].find( p => p.faction.name == 'gc')) ? [G.choices.fight.player, G.choices.fight.enemy].find( p => p.faction.name == 'gc') : null
            if (!devoued || G.units.find( u => u.type = 'Great Cthulhu').place != G.choices.fight.place || !devoured.units.find( u => u.tier < 2 && u.place == G.choices.fight.place )) {
                phs.endStage()
                return 
            }
            G.turn.pi = G.players.indexOf(devoured)
            G.forceRerender()
        },
        options : f => (devoured) ? devoured.units.filter( u => u.tier < 2 && u.place == G.choices.fight.place ) : [],
        moves : {
            choose : (np,c) => {
                if ( np != 'unit' || np != 'devourunit' || !devoured?.units.filter( u => u.tier < 2 && u.place == G.choices.fight.place ).includes(c)) return
                c.place = ''
                G.turn.pi = G.players.indexOf([G.choices.fight.player, G.choices.fight.enemy].find( p => p.faction.name != devoured.faction.name))
                phs.endStage()
            }
        }
    }
    phs.addStage('devourunit',dvstage,'fight','roll')
}
let yhanthlei = () => {
    let yhstage = {
        init : f=>{
            G.players.find( p => p.faction.name == 'gc' ).power += G.player.power += oceans.filter( o => G.places[o].gate && G.units.filter( u => u.place == o && u.gate && H.findPly(u.owner).faction.name != 'gc' ).length ).length
            phs.endStage()
        },
        options : f=>[],
        moves : {
            choose : (np,c) => {}
        },
    }
    yhstage.next = G.phases.gather.start||''
    G.phases.gather.start = 'yhanthlei'
    G.phases.gather.stages['yhanthlei'] = yhstage
}
let regenerate = () => phs.addStage( 'regenerate',{
    init : f=>{
        G.players.find( p => p.faction.name=='gc').units.filter( u => u.type == 'Starspawn' && u.place == G.choices.fight.place).map( f => (G.players.find( p => p.faction.name=='gc').temp.phase.kills) ? G.players.find( p => p.faction.name=='gc').temp.phase.kills-- : G.players.find( p => p.faction.name=='gc').temp.phase.pains--)
        phs.endStage()
    },
    options : f=>[],
    moves : {
        choose : (np,c) => {}
    },
},'fight','roll')
let absorb = () => phs.addStage( 'absorbunit',{
    init : f=>{
        G.units.filter( u => u.type == 'Shoggoth').map( u => u.absorb = 0)
        if ( ![G.choices.fight.player,G.choices.fight.enemy].find( p => p.faction.name == 'gc') || !G.units.find( u => u.type == 'Shoggoth' && u.place == G.choices.fight.place) ) {
            phs.endStage()
            return
        }
        phs.interuptStage('fight','absorbunit',G.players.indexOf(G.players.find( p => p.faction.name == 'gc')))
    },
    options : f=>G.player.units.filter( u => u.tier < 2 && u.type != 'Shoggoth' && u.place == G.choices.fight.place),
    moves : {
        choose : (np,c) => {
            if ( ( np != 'unit' && np != 'absorbunit') || !G.player.units.filter( u => u.tier < 2 && u.type != 'Shoggoth' && u.place == G.choices.fight.place).includes(c) ) return
            c.place = ''
            G.units.find( u => u.type == 'Shoggoth' && u.place == G.choices.fight.place).absorb+=3
            G.forceRerender()
        },
        done : (np,c) => {phs.returnStage(); if(G.stage == 'absorbunit') phs.endStage()}
    },
},'fight','enemy')
let immortal = () => phs.addStage( 'immortal', {
    init : f => {
        G.player.sign += (G.player.faction.name == 'gc' && G.choices.awaken.unit.tier >= 2)
        phs.endStage()
    }
}, 'awaken','place')

export default faction