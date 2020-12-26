let G
let phs
let faction = (g,p) => {
    G = g;
    phs = p
    let books = ["Blood Sacrifice","Frenzy","Ghroth","Necrophagy","The Red Sign","The Thousand Young"]
    let bookinit = {
        "Blood Sacrifice":blood,
        "Frenzy":frenzy,
        "Ghroth":ghroth,
        "Necrophagy":necrophagy,
        "The Red Sign":redsign,
        "The Thousand Young":thousand
    }
    let bookreqs = [
        {'sac 2 cults':f=>false },
        {'be in 4 areas':f=> Object.keys(G.places).filter( p => G.player.units.map( u => u.place ).includes(p) ).length > 3 },
        {'be in 6 areas':f=> Object.keys(G.places).filter( p => G.player.units.map( u => u.place ).includes(p) ).length > 5 },
        {'be in 8 areas':f=> Object.keys(G.places).filter( p => G.player.units.map( u => u.place ).includes(p) ).length > 7 },
        {"Awaken Shub Nigur'rath":f=> G.choices.awaken.unit?.type=="Shub Nigur'rath"},
        {'be in all enemy areas':f=> G.players.filter( pl => pl.units.filter( un => Object.keys(G.places).filter( p => G.player.units.map( u => u.place ).includes(p) ).includes(un.place) ).length).length == G.players.length  }
    ]
    let goo = "Shub Nigur'rath"
    let mons = {'Ghoul':2,Fungi:4,'Dark Young':2}
    let color = 'red'
    let start = 'westafrica'
    let name = 'bg'
    let units = []
    let addUnit = (u,p) => {
        u.owner = p
        p.units = [...p.units,u]
    }
    let awakenshub = {
        awakenplaces: () => G.player.units.filter( u => u.gate ).map( u => u.place ),
        awakenreq: ()=>G.player.power > 7 && G.player.units.filter( u => u.place != '' && u.type == 'cult').length > 1 && G.player.units.filter( u => u.gate ).length,
        cost: ()=>{ G.player.power-=8; G.player.sac = 2; phs.setStage('bg-sacunit');},
    }
    let initUnits = p => {
        p.units = [
            ...p.units,
            {...G.unit("Shub Nigur'rath",p,'',8,()=>p.units.filter( u => u.type == 'cult').length,2),...awakenshub},
            ...[0,1,].map( f=> G.unit('Ghoul',p,'',1,0,1)),
            ...[0,1,2,3].map( f=> G.unit('Fungi',p,'',2,1,1)),
            ...[0,1,2].map( f=> G.unit('Dark Young',p,'',3,2,1,1)),
        ]
    }
    
    fertility()
    bgsac()
    sac2cult()
    avatar()
    let faction = {books,bookreqs,bookinit,goo,mons,color,start,name,units,addUnit,initUnits}
    
    return faction
}
export default faction

let lim = 1, unlim = 1, req = f => true, init = f => {}
// let templ = {
//     phase : {
//         lim,
//         init,
//         req : f => true,
//         start : '',
//         stages: {               
//             stage : {
//                 next : '',
//                 options : f => [],
//                 moves : {
//                     choose : (np, c) => {
//                         phs.endStage()
//                     },
//                     done : f => {
//                         endPhase()
//                     }
//                 }
//             }
//         }
//     }
// }

let sac2cult = () => phs.addPhase('sac 2 cultists',{
    lim,
    req : f => G.player.faction.name=='bg' && G.player.faction.bookreqs.find( b => b['sac 2 cults'] ),
    start : 'unit',
    stages: {               
        unit : {
            init : f => G.player.sacs = 2,
            options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ),
            moves : {
                choose : (np, c) => {
                    if ( ( np == 'unit' || np == 'sac 2 cultists' ) && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ).includes(c)) {
                        G.player.sacs--
                        c.place=''
                        if (G.player.sacs == 0) {
                            G.player.faction.bookreqs[0]['sac 2 cults'] = f => true
                            phs.endPhase()
                        }
                        else G.forceRerender()
                    }
                }
            }
        }
    }
})
let bgsac = () => phs.addStage('bg-sacunit',{
    init : f => G.player.sacs = 2,
    options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ),
    moves : {
        choose : (np, c) => {
            if ( (np == 'unit' || np == 'bg-sacunit') && G.player.units.filter( u => u.type == 'cult' ).includes(c) ) {
                G.player.sacs--
                c.place=''
                G.forceRerender()
                if (G.player.sacs == 0) phs.endStage()
            }
        }
    }
},'awaken')

let avatar = () => {
    G.choices.avatar = {place:null,faction:null,unit:null}
    phs.addPhase('avatar',{
        lim,
        init,
        req : f => G.player.faction.name=='bg' && G.player.units.find( u => u.type == "Shub Nigur'rath" && u.place != '' ) && G.player.power >= 1,
        start : 'place',
        stages: {               
            place : {
                next : 'faction',
                options : f => Object.keys(G.places).filter( p => G.units.map( u => u.place ).includes(p) ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'place' && G.units.map( u => u.place ).includes(c)) {
                            G.choices.avatar.place = c
                            phs.endStage()
                        }
                    }
                }
            },
            faction : {
                next : 'unit',
                options : f => G.players.filter( p => p.units.map( u => u.place).includes( G.choices.avatar.place ) ).map( p => p.faction.name ),
                moves : {
                    choose : (np, c) => {
                        if  ( np == 'faction' && G.players.filter( p => p.units.map( u => u.place).includes( G.choices.avatar.place ) ).map( p => p.faction.name ).includes(c) ){
                            G.choices.avatar.faction = G.players.find( p => p.faction.name == c)
                            G.stage = 'resolve'
                            phs.interuptStage('avatar','unit',G.players.indexOf(G.choices.avatar.faction))
                        }
                        else if ( np == 'player' && G.players.filter( p => p.units.map( u => u.place).includes( G.choices.avatar.place ) ).includes(c) ) {
                            G.choices.avatar.faction = c
                            G.stage = 'resolve'
                            phs.interuptStage('avatar','unit',G.players.indexOf(G.choices.avatar.faction))
                        }
                    }
                }
            },
            unit : {
                next : 'resolve',
                options : f => G.choices.avatar.faction.units.filter( u => u.place == G.choices.avatar.place ),
                moves : {
                    choose : (np, c) => {
                        if  ( np == 'unit' && G.choices.avatar.faction.units.filter( u => u.place == G.choices.avatar.place ).includes(c) ){
                            G.choices.avatar.unit = c
                            phs.endStage()
                        }
                    }
                }
            },
            resolve : {
                init : f => {
                    G.choices.avatar.unit.place = G.choices.avatar.place
                    G.turn.pi = G.players.indexOf(G.players.find(p => p.faction.name == 'bg'))
                    G.players[G.turn.pi].power--
                    G.players[G.turn.pi].units.find( u => u.name == "Shub Nigur'rath").place = G.choices.avatar.place
                    phs.endStage()
                },
                moves : {},
                options : f => [],
            }

        }
    })
}

let necrophagy = () => {
    G.choices.necro = { once : null }
    phs.addStage('necrounits',{
        options : f => G.player.units.filter( u => u.type == 'Ghoul' && u.place != '' && !u.moved),
        init : f => {
            if ( G.choices.necro.once) {G.choices.necro.once = null; phs.endStage()}
            else {
                G.stage = 'assignpretreats'
                phs.interuptStage('fight','necrounits',G.players.indexOf(G.players.find( p => p.faction.name == 'bg' )))
            }
        },
        moves : {
            choose : (np,c) => {
                if ( c.type == 'Ghoul' && c.place != '' && !c.moved) {
                    G.choices.fight.enemy.pains++
                    G.choices.fight.player.pains++
                    c.moved = 1
                    c.place = G.choices.fight.place
                    G.forceRerender()
                }
            },
            done : f => {        
                G.choices.necro.once = 1
                G.player.units.map( u => u.moved = 0)
                phs.returnStage()
            },
        }
    },'fight','placeeretreats')
}

let ghroth = () => {
    G.choices.ghroth = { roll : 0, offers : [], tries : 3, negotiated : 0 }
    phs.addPhase('ghroth',{
        lim,
        init : f => {
            G.choices.ghroth.roll = roll(G.places.filter( p => G.player.units.filter( u => u.type == 'Fungi' ).map( u => u.place).includes(p) ).length )
            G.choices.ghroth.offers = Array(G.players.length).fill(0)
            G.turn.pi++
        },
        req : f => G.player.power > 1,
        start : 'negotiate',
        stages: {               
            negotiate : {
                next : 'unit',
                options : f => Array(G.choices.ghroth.roll+1).fill(0).map( (l,i) => i).filter( l => l < G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ).length ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'negotiate' && Array(G.choices.ghroth.roll+1).fill(0).map( (l,i) => i).filter( l => l < G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ).length ).includes(c) ) {
                            G.choices.ghroth.offers[G.turn.pi%G.players.length] = c
                            G.turn.pi++
                            if ( G.players[G.turn.pi].faction.name=='bg') {
                                tries--
                                G.choices.ghroth.negotiated = (G.choices.ghroth.offers.reduce((acc,cur)=>acc+cur,0) >= G.choices.ghroth.roll )
                            }
                            if ( G.choices.ghroth.tries || G.choices.ghroth.negotiated) G.turn.pi++
                            if (!G.choices.ghroth.tries || G.choices.ghroth.negotiated) setStage( (G.choices.ghroth.negotiated) ? 'unit' : 'altunit')
                            G.forceRerender()
                        }
                        
                    },
                }
            },             
            unit : {
                next : '',
                options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'unit' && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ).includes(c)) {
                            c.place = ''
                            G.ghroth.choices.offers[G.turn.pi%G.players.length]--
                            if(!G.ghroth.choices.offers[G.turn.pi%G.players.length]) G.turn.pi++
                            G.forceRerender()
                            if(!G.ghroth.choices.offers.reduce((acc,cur)=>acc+cur,0)) phs.endStage()
                        }
                    },
                }
            },             
            altunit : {
                init : f => G.choices.ghroth.offers = G.choices.ghroth.offers.reduce((acc,cur)=>acc+cur,0),
                next : '',
                options : f => G.units.filter( u=> u.type == 'cult' && Object.keys(G.places).includes(u.place) ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'unit' && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ).includes(c)) {
                            c.place = ''
                            G.ghroth.choices.offers--
                            G.forceRerender()
                            if(!G.ghroth.choices.offers) phs.endStage()
                        }
                    },
                }
            }
        }
    })
}

let blood = () => {
    phs.addStage('bloodinit',{
        init : f => phs.interuptStage( 'doom','blood',G.players.indexOf( G.players.find( p => p.faction.name=='bg') ) ),
        options : f => [],
        moves : { choose : (np,c) => {} }
    },'doom','doom');
    
    phs.addStage('blood',{
        next : 'bloodunit',
        options : f => ['blood sacrifice'],
        moves : { 
            choose : (np,c) => {
                if ( c == 'blood sacrifice') phs.endStage()
            },
            done : f => phs.returnStage()
        }
    },'doom');
    
    phs.addStage('bloodunit',{
        options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ),
        moves : { 
            choose : (np,c) => {
                if ( (np == 'unit' || np == 'bloodunit') && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ) ) {
                    c.place = ''
                    G.player.signs++
                    phs.returnStage()
                }
            }
        }
    },'doom');
}

let fertility = () => phs.addStage('fertility',{
    init : f => {G.turn.lim+=G.player.faction.name=='bg';phs.endStage()},
    options : f => [],
    moves : { choose : (np,c) => {}}
},'summon','place')

let frenzy = () => G.player.units.filter( u => u.type == 'cult' ).map( u => u.combat = 1 )

let thousand = () => G.player.units.filter( u => u.tier == 1 ).map( u => {let cost = 0+u.cost; u.cost = f => cost - G.units.find( un => un.type == "Shub Nigur'rath").place != '' })

let redsign = () => G.player.units.filter( u => u.type == 'Dark Young' ).map( u => u.gatherer = 1 )

