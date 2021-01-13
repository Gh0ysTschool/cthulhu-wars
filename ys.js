let G
let phs
let faction = (g,p) => {
    G = g;
    phs = p
    let books = ["He Who Must Not Be Named","Passion","Shriek of the Byakhee","The Screaming Dead","The Third Eye","Zin Gaya",]
    let bookinit = {
        "He Who Must Not Be Named":named,
        "Passion":passion,
        "Shriek of the Byakhee":shriek,
        "The Screaming Dead":scream,
        "The Third Eye":thirdeye,
        "Zin Gaya":zingaya
    }
            
    let bookreqs = [
        {'gift 3 doom':f=>false },
        {'Desecrate \\|/':f=> Object.values(G.places).filter( p => p.desecrated && p.glyphs['\\|/']).length },
        {'Desecrate \\o/':f=> Object.values(G.places).filter( p => p.desecrated && p.glyphs['\\o/']).length },
        {'Desecrate \\-/':f=> Object.values(G.places).filter( p => p.desecrated && p.glyphs['\\-/']).length },
        {"Awaken King in Yellow":f=> G.choices.awaken.unit?.name=='King in Yellow'},
        {"Awaken Hastur":f=> G.choices.awaken.unit?.name=='Hastur'}
    ]
    let goo = ['King in Yellow','Hastur']
    let mons = {Undead:2,"Bya'khee":4}
    let color = 'yellow'
    let start = 'europe'
    let name = 'ys'
    let units = []
    let addUnit = (u,p) => {
        u.owner = p
        p.units = [...p.units,u]
    }
    let awakenking = {
        awakenplaces: () => Object.keys(G.places).filter( p => !G.places[p].gate && G.player.units.filter( u => u.place == p).length ),
        awakenreq: () => G.player.power > 3 && Object.keys(G.places).filter( p => !G.places[p].gate && G.player.units.filter( u => u.place == p).length ).length,
        cost: () => { G.player.power-=4; phs.endStage(); },
    }
    let awakenhast = {
        awakenplaces: () => G.player.units.filter( u => u.gate && u.place == G.player.units.find( u => u.type == 'King in Yellow' ).place ).map( u => u.place ),
        awakenreq: () => G.player.power > 9 && G.player.units.filter( u => u.gate && u.place == G.player.units.find( u => u.type == 'King in Yellow' ).place ).length,
        cost: () => { G.player.power-=10; phs.endStage(); },
    }
    let initUnits = p => {
        p.units = [
            ...p.units,
            {...G.unit("Hastur",p,'',10,f=>G.ritual.cost,2),...awakenhast},
            {...G.unit("King in Yellow",p,'',4,0,2),...awakenking},
            ...[0,1,2,3,4,5].map( f=> G.unit('Undead',p,'',1,f=>G.units.filter( u => u.place == G.choices.combat.place && u.type == "Undead").length-1,1)),
            ...[0,1,2,3].map( f=> G.unit("Bya'khee",p,'',2,f=>G.units.filter( u => u.place == G.choices.combat.place && u.type == "Bya'khee").length+1,1)),
        ]
    }

    desecrate()
    gift3doom()
    vengence()
    feast()
    let faction = {bookinit,books,bookreqs,goo,mons,color,start,name,units,addUnit,initUnits}
    return faction
}

let lim = 1, unlim = 1
let gift3doom = () => phs.addPhase('gift 3 doom',{
    lim,
    req : f => G.player.faction.name=='ys' && G.player.faction.bookreqs.find( b => b['gift 3 doom'] ),
    start : 'player',
    stages: {               
        player : {
            options : f => G.players.filter( p => p.faction.name != 'ys' ),
            moves : {
                choose : (np, c) => {
                    if ( ( np == 'player' || np == 'gift 3 doom' ) && G.players.filter( p => p.faction.name != 'ys' ).includes(c)) {
                        c.doom+=3
                        G.player.faction.bookreqs[0]['gift 3 doom'] = f => true
                        phs.endPhase()
                    }
                }
            }
        }
    }
})

let named = () => {
    G.player.temp.turn.named = 1
    phs.addPhase('named',{
        unlim,
        req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'Hastur' && G.places[u.place] ) && !G.player.temp.turn.named && !G.player.temp.turn.scream && G.player.power > 0,
        start : 'place',
        stages: {               
            place : {
                options : f=>Array.from( new Set(G.unit.filter( u => u.type == 'cult' && u.faction.name != 'ys' ).map( u => u.place ) ) ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'place' || np == 'named' ) && Array.from( new Set(G.unit.filter( u => u.type == 'cult' && u.faction.name != 'ys' ).map( u => u.place ) ) ).includes(c)) {
                            G.player.temp.turn.named = 1
                            G.player.units.find( u => u.type == 'Hastur' ).place = c
                            G.player.power--
                            phs.endPhase()
                        }
                    }
                }
            }
        }
    })
}

let shriek = () => {
    G.choices.shriek = {place:null}
    phs.addPhase('shriek',{
        lim,
        req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'Byakhee' && G.places[u.place]) && G.player.power > 0,
        start : 'place',
        stages: {               
            place : {
                next : 'unit',
                options : f=>G.places,
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'place' || np == 'shriek' ) && G.places.includes(c) ) {
                            G.choices.shriek.place = c
                            G.player.power--
                            phs.endPhase()
                        }
                    }
                }
            },              
            unit : {
                options : f=> G.player.units.filter( u => u.type == 'Byakhee' && G.places[u.place] && u.place != G.choices.shriek.place ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'unit' || np == 'shriek' ) && G.player.units.filter( u => u.type == 'Byakhee' && G.places[u.place] && u.place != G.choices.shriek.place ).includes(c) ) {
                            c.place = G.choices.shriek.place
                            G.forceRerender()
                        }
                    },
                    done : f => phs.endStage()
                }
            }
        }
    })
}

let zingaya = () => {
    G.choices.zingaya = {place:null}
    phs.addPhase('shriek',{
        lim,
        req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'Undead' && u.place == '' ) && G.player.units.find( u => u.type == 'Undead' && G.places[u.place] && G.units.find( uu => uu.owner.faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ) && G.player.power > 0,
        start : 'place',
        stages: {               
            place : {
                next : 'unit',
                options : f=> Array.from( new Set( G.player.units.find( u => u.type == 'Undead' && G.places[u.place] && G.units.find( uu => uu.owner.faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ).map( u => u.place ) ) ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'place' || np == 'zingaya' ) && Array.from( new Set( G.player.units.find( u => u.type == 'Undead' && G.places[u.place] && G.units.find( uu => uu.owner.faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ).map( u => u.place ) ) ).includes(c) ) {
                            G.choices.zingaya.place = c
                            phs.endPhase()
                        }
                    }
                }
            },              
            unit : {
                options : f=> G.units.filter( u => u.owner.faction.name != 'ys' && u.type == 'cult' && u.place == G.choices.zingaya.place ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'unit' || np == 'zingaya' ) && G.units.filter( u => u.owner.faction.name != 'ys' && u.type == 'cult' && u.place == G.choices.zingaya.place ).includes(c) ) {
                            G.player.units.find( u => u.type == 'Undead' && u.place == '' ).place = c.place
                            G.player.power--
                            c.place = ''
                            phs.endStage()
                        }
                    },
                }
            }
        }
    })
}

let desecrate = () => {
    let roll
    phs.addPhase('desecrate',{
        lim,
        req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'King in Yellow' && G.places[u.place] ) && !G.places[G.player.units.find( u => u.type == 'King in Yellow' && G.places[u.place] ).place].glyphs.includes('desecration') && G.player.power > 1,
        start : 'roll',
        stages: {               
            roll : {
                init : f=> {
                    G.player.power-= (2 - ( G.player.books.includes("The Third Eye") && G.places[ G.player.units.find( u => u.type == 'Hastur' ).place ] ) )
                    roll = phs.roll(1)
                    if (phs.roll(1) >= G.player.units.filter( u => u.place == G.player.units.find( u => u.type == 'King in Yellow' ).place ).length ) {
                        G.places[G.player.units.find( u => u.type == 'King in Yellow' ).place].glyphs.push('desecration')
                        phs.endStage()
                    } else {
                        phs.setStage('unit')
                    }
                },
            },              
            unit : {
                options : f=> G.player.units.filter( u => u.owner.faction.name != 'ys' && u.cost <= 2 && u.place == '' ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'unit' || np == 'desecrate' ) && G.player.units.filter( u => u.owner.faction.name != 'ys' && u.cost <= 2 && u.place == '' ).includes(c) ) {
                            c.place = G.player.units.find( u => u.type = 'King in Yellow' )
                            phs.endStage()
                        }
                    },
                    done : f=>phs.endStage()
                }
            }
        }
    })
}

let scream = () => {
    G.player.temp.turn.scream = 1
    G.choices.scream = {place:null}
    phs.addPhase('scream',{
        unlim,
        req : f => G.player.faction.name == 'ys' && G.places[G.player.units.find( u => u.type = 'King in Yellow' ).place] && !G.player.temp.turn.named && !G.player.temp.turn.scream && G.player.power > 0,
        start : 'place',
        stages: {               
            place : {
                next : 'unit',
                options : f=>G.places[ G.player.units.find( u => u.type == 'King in Yellow' ).place ].adjacent,
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'place' || np == 'scream' ) && G.places[ G.player.units.find( u => u.type == 'King in Yellow' ).place ].adjacent.includes(c) ) {
                            G.choices.scream.place = c
                            G.player.temp.turn.scream = 1
                            G.player.power--
                            phs.endPhase()
                        }
                    }
                }
            },
            unit : {
                options : f=> G.player.units.filter( u => u.type == 'Undead' && u.place == G.player.units.find( u => u.type = 'King in Yellow' ).place ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'place' || np == 'scream' ) && G.player.units.filter( u => u.type == 'Undead' && u.place == G.player.units.find( u => u.type = 'King in Yellow' ).place ).includes(c) ) {
                            c.place = G.choices.scream.place
                            if ( G.player.units.filter( u => u.type == 'Undead' && u.place == G.player.units.find( u => u.type = 'King in Yellow' ).place ).length )
                                G.forceRerender()
                            else {
                                G.player.units.find( u => u.type = 'King in Yellow' ).place = G.choices.scream.place
                                phs.endStage()
                            }
                        }
                    },
                    done : f => {
                        G.player.units.find( u => u.type = 'King in Yellow' ).place = G.choices.scream.place
                        phs.endStage()
                    }
                }
            }
        }
    })
}

let feast = () => phs.addStage('feast',{
    init : f => {
        G.players.find( p => p.faction.name == 'ys' ).power += G.places.filter( p => G.places[p].glyphs.includes('desecration') && G.units.find( u => u.place == p) ).length
        phs.endStage()
    }
},'gather','start')

let passion = () => {
    let cultists = G.player.units.filter( u => u.type == 'cult' && G.places[u.place] ).length
    let pastage = {
        init : f=>{
            if ( G.players.find( p => p.faction.name == 'ys' ).units.filter( u => u.type == 'cult' && G.places[u.place] ).length < cultists )
                G.players.find( p => p.faction.name == 'ys' ).power += cultists - G.players.find( p => p.faction.name == 'ys' ).units.filter( u => u.type == 'cult' && G.places[u.place] ).length
            cultists = G.players.find( p => p.faction.name == 'ys' ).units.filter( u => u.type == 'cult' && G.places[u.place] ).length
            phs.endStage()
        },
    }
    pastage.next = G.phases.action.start||''
    G.phases.action.start = 'passion'
    G.phases.action.stages['passion'] = pastage
}

let thirdeye = () => {
    phs.addStage('thirdeye',{
        init : f => {
            G.player.signs += G.places.includes( G.player.units.find( u => u.type == 'Hastur' ).place )
            phs.endStage()
        }
    },'desecrate','roll')
}

let vengence = () => {
    let interupted
    phs.phases.fight.stages.assignekills.init = {
        init : f => {
            interupted = [G.choices.fight.enemy,G.choices.fight.player].find( p => p.faction.name == 'ys' ) && G.units.find( u => u.type == 'Hastur').place == G.choices.fight.place
            if ( interupted )
                phs.interuptStage('fight','assignekills',G.players.indexOf(G.players.find( p => p.faction.name == 'ys' ) ))
        },
    }
    phs.addStage('veng-e',{
        init : f => {
            if ( interupted ) {
                interupted = false
                phs.returnStage()
                phs.endStage()
            }
            else
                phs.endStage()
        }
    },'fight','assignekills')
    phs.phases.fight.stages.assignpkills.init = {
        init : f => {
            interupted = [G.choices.fight.enemy,G.choices.fight.player].find( p => p.faction.name == 'ys' ) && G.units.find( u => u.type == 'Hastur').place == G.choices.fight.place
            if ( interupted )
                phs.interuptStage('fight','assignpkills',G.players.indexOf(G.players.find( p => p.faction.name == 'ys' ) ))
        },
    }
    phs.addStage('veng-p',{
        init : f => {
            if ( interupted ) {
                interupted = false
                phs.returnStage()
                phs.endStage()
            }
            else
                phs.endStage()
        }
    },'fight','assignpkills')
}
export default faction