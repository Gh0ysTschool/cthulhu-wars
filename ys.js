let G, phs, H
let faction = (g,p,h) => {
    G = g
    phs = p
    H = h
    let books = ["He Who Must Not Be Named","Passion","Shriek of the Byakhee","The Screaming Dead","The Third Eye","Zin Gaya"]
    let bookinit = ["He Who Must Not Be Named","Passion","Shriek of the Byakhee","The Screaming Dead","The Third Eye","Zin Gaya"]
    // {
    //     "He Who Must Not Be Named":named,
    //     "Passion":passion,
    //     "Shriek of the Byakhee":shriek,
    //     "The Screaming Dead":scream,
    //     "The Third Eye":thirdeye,
    //     "Zin Gaya":zingaya
    // }
    H["He Who Must Not Be Named"]=named
    H["Passion"]=passion
    H["Shriek of the Byakhee"]=shriek
    H["The Screaming Dead"]=scream
    H["The Third Eye"]=thirdeye
    H["Zin Gaya"]=zingaya
            
    let bookreqs = [
        'gift 3 doom',
        'Desecrate \\|/',
        'Desecrate \\o/',
        'Desecrate \\-/',
        "Awaken King in Yellow",
        "Awaken Hastur"
        // {'gift 3 doom':f=>false },
        // {'Desecrate \\|/':f=> Object.values(G.state.places).filter( p => p.desecrated && p.glyphs['\\|/']).length },
        // {'Desecrate \\o/':f=> Object.values(G.state.places).filter( p => p.desecrated && p.glyphs['\\o/']).length },
        // {'Desecrate \\-/':f=> Object.values(G.state.places).filter( p => p.desecrated && p.glyphs['\\-/']).length },
        // {"Awaken King in Yellow":f=> G.state.choices.awaken.unit?.type=='King in Yellow'},
        // {"Awaken Hastur":f=> G.state.choices.awaken.unit?.type=='Hastur'}
    ]
    
    H['gift 3 doom']=f=>false 
    H['Desecrate \\|/']=f=> Object.values(G.state.places).filter( p => p.desecrated && p.glyphs['\\|/']).length 
    H['Desecrate \\o/']=f=> Object.values(G.state.places).filter( p => p.desecrated && p.glyphs['\\o/']).length 
    H['Desecrate \\-/']=f=> Object.values(G.state.places).filter( p => p.desecrated && p.glyphs['\\-/']).length 
    H["Awaken King in Yellow"]=f=> G.state.choices.awaken.unit?.type=='King in Yellow'
    H["Awaken Hastur"]=f=> G.state.choices.awaken.unit?.type=='Hastur'

    let color = 'yellow'
    let start = 'europe'
    let name = 'ys'
    let units = []
    let awakenking = {
        awakenplaces: () => Object.keys(G.state.places).filter( p => !G.state.places[p].gate && G.player.units.filter( u => u.place == p).length ),
        awakenreq: () => G.player.power > 3 && Object.keys(G.state.places).filter( p => !G.state.places[p].gate && G.player.units.filter( u => u.place == p).length ).length,
        cost: () => { G.player.power-=4; phs.endStage(); },
    }
    let awakenhast = {
        awakenplaces: () => G.player.units.filter( u => u.gate && u.place == G.player.units.find( u => u.type == 'King in Yellow' ).place ).map( u => u.place ),
        awakenreq: () => G.player.power > 9 && G.player.units.filter( u => u.gate && u.place == G.player.units.find( u => u.type == 'King in Yellow' ).place ).length,
        cost: () => { G.player.power-=10; phs.endStage(); },
    }
    H['Hastur'] = awakenhast
    H['King in Yellow'] = awakenking
    let initUnits = p => {
        p.units = [
            ...p.units,
            {...H.unit("Hastur",name,'',10,f=>G.ritual.cost,2),...awakenhast},
            {...H.unit("King in Yellow",name,'',4,0,2),...awakenking},
            ...[0,1,2,3,4,5].map( f=> H.unit('Undead',name,'',1,f=>G.units.filter( u => u.place == G.state.choices.combat.place && u.type == "Undead").length-1,1)),
            ...[0,1,2,3].map( f=> H.unit("Byakhee",name,'',2,f=>G.units.filter( u => u.place == G.state.choices.combat.place && u.type == "Bya'khee").length+1,1)),
        ]
    }

    desecrate()
    gift3doom()
    vengence()
    feast()
    let faction = {bookinit,books,bookreqs,color,start,name,units,initUnits}
    return faction
}

let lim = 1, unlim = 1
let gift3doom = () => phs.addPhase('gift 3 doom',{
    lim,
    req : f => G.player.faction.name=='ys' && G.player.faction.bookreqs.includes('gift 3 doom'),
    start : 'player',
    stages: {               
        player : {
            options : f => G.state.players.filter( p => p.faction.name != 'ys' ),
            moves : {
                choose : (np, c) => {
                    if ( ( np == 'player' || np == 'gift 3 doom' ) && G.state.players.filter( p => p.faction.name != 'ys' ).includes(c)) {
                        c.doom+=3
                        H['gift 3 doom'] = f => true
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
        req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'Hastur' && G.state.places[u.place] ) && !G.player.temp.turn.named && !G.player.temp.turn.scream && G.player.power > 0,
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
    G.state.choices.shriek = {place:null}
    phs.addPhase('shriek',{
        lim,
        req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'Byakhee' && G.state.places[u.place]) && G.player.power > 0,
        start : 'place',
        stages: {               
            place : {
                next : 'unit',
                options : f=>G.state.places,
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'place' || np == 'shriek' ) && G.state.places.includes(c) ) {
                            G.state.choices.shriek.place = c
                            G.player.power--
                            phs.endPhase()
                        }
                    }
                }
            },              
            unit : {
                options : f=> G.player.units.filter( u => u.type == 'Byakhee' && G.state.places[u.place] && u.place != G.state.choices.shriek.place ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'unit' || np == 'shriek' ) && G.player.units.filter( u => u.type == 'Byakhee' && G.state.places[u.place] && u.place != G.state.choices.shriek.place ).includes(c) ) {
                            c.place = G.state.choices.shriek.place
                            H.forceRerender()
                        }
                    },
                    done : f => phs.endStage()
                }
            }
        }
    })
}

let zingaya = () => {
    G.state.choices.zingaya = {place:null}
    phs.addPhase('shriek',{
        lim,
        req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'Undead' && u.place == '' ) && G.player.units.find( u => u.type == 'Undead' && G.state.places[u.place] && G.units.find( uu => H.findPlyr(uu.owner).faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ) && G.player.power > 0,
        start : 'place',
        stages: {               
            place : {
                next : 'unit',
                options : f=> Array.from( new Set( G.player.units.find( u => u.type == 'Undead' && G.state.places[u.place] && G.units.find( uu => H.findPlyr(uu.owner).faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ).map( u => u.place ) ) ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'place' || np == 'zingaya' ) && Array.from( new Set( G.player.units.find( u => u.type == 'Undead' && G.state.places[u.place] && G.units.find( uu => H.findPlyr(uu.owner).faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ).map( u => u.place ) ) ).includes(c) ) {
                            G.state.choices.zingaya.place = c
                            phs.endPhase()
                        }
                    }
                }
            },              
            unit : {
                options : f=> G.units.filter( u => H.findPlyr(u.owner).faction.name != 'ys' && u.type == 'cult' && u.place == G.state.choices.zingaya.place ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'unit' || np == 'zingaya' ) && G.units.filter( u => H.findPlyr(u.owner).faction.name != 'ys' && u.type == 'cult' && u.place == G.state.choices.zingaya.place ).includes(c) ) {
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
        req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'King in Yellow' && G.state.places[u.place] ) && !G.state.places[G.player.units.find( u => u.type == 'King in Yellow' && G.state.places[u.place] ).place].glyphs.includes('desecration') && G.player.power > 1,
        start : 'roll',
        stages: {               
            roll : {
                init : f=> {
                    G.player.power-= (2 - ( G.player.books.includes("The Third Eye") && G.state.places[ G.player.units.find( u => u.type == 'Hastur' ).place ] ) )
                    roll = phs.roll(1)
                    if (phs.roll(1) >= G.player.units.filter( u => u.place == G.player.units.find( u => u.type == 'King in Yellow' ).place ).length ) {
                        G.state.places[G.player.units.find( u => u.type == 'King in Yellow' ).place].glyphs.push('desecration')
                        phs.endStage()
                    } else {
                        phs.setStage('unit')
                    }
                },
            },              
            unit : {
                options : f=> G.player.units.filter( u => H.findPlyr(u.owner).faction.name != 'ys' && u.cost <= 2 && u.place == '' ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'unit' || np == 'desecrate' ) && G.player.units.filter( u => H.findPlyr(u.owner).faction.name != 'ys' && u.cost <= 2 && u.place == '' ).includes(c) ) {
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
    G.state.choices.scream = {place:null}
    phs.addPhase('scream',{
        unlim,
        req : f => G.player.faction.name == 'ys' && G.state.places[G.player.units.find( u => u.type = 'King in Yellow' ).place] && !G.player.temp.turn.named && !G.player.temp.turn.scream && G.player.power > 0,
        start : 'place',
        stages: {               
            place : {
                next : 'unit',
                options : f=>G.state.places[ G.player.units.find( u => u.type == 'King in Yellow' ).place ].adjacent,
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'place' || np == 'scream' ) && G.state.places[ G.player.units.find( u => u.type == 'King in Yellow' ).place ].adjacent.includes(c) ) {
                            G.state.choices.scream.place = c
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
                            c.place = G.state.choices.scream.place
                            if ( G.player.units.filter( u => u.type == 'Undead' && u.place == G.player.units.find( u => u.type = 'King in Yellow' ).place ).length )
                                H.forceRerender()
                            else {
                                G.player.units.find( u => u.type = 'King in Yellow' ).place = G.state.choices.scream.place
                                phs.endStage()
                            }
                        }
                    },
                    done : f => {
                        G.player.units.find( u => u.type = 'King in Yellow' ).place = G.state.choices.scream.place
                        phs.endStage()
                    }
                }
            }
        }
    })
}

let feast = () => phs.addStage('feast',{
    init : f => {
        G.state.players.find( p => p.faction.name == 'ys' ).power += G.state.places.filter( p => G.state.places[p].glyphs.includes('desecration') && G.units.find( u => u.place == p) ).length
        phs.endStage()
    }
},'gather','start')

let passion = () => {
    let cultists = G.player.units.filter( u => u.type == 'cult' && G.state.places[u.place] ).length
    let pastage = {
        init : f=>{
            if ( G.state.players.find( p => p.faction.name == 'ys' ).units.filter( u => u.type == 'cult' && G.state.places[u.place] ).length < cultists )
                G.state.players.find( p => p.faction.name == 'ys' ).power += cultists - G.state.players.find( p => p.faction.name == 'ys' ).units.filter( u => u.type == 'cult' && G.state.places[u.place] ).length
            cultists = G.state.players.find( p => p.faction.name == 'ys' ).units.filter( u => u.type == 'cult' && G.state.places[u.place] ).length
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
            G.player.signs += G.state.places.includes( G.player.units.find( u => u.type == 'Hastur' ).place )
            phs.endStage()
        }
    },'desecrate','roll')
}

let vengence = () => {
    let interupted
    phs.phases.fight.stages.assignekills.init = {
        init : f => {
            interupted = [G.state.choices.fight.enemy,G.state.choices.fight.player].find( p => p.faction.name == 'ys' ) && G.units.find( u => u.type == 'Hastur').place == G.state.choices.fight.place
            if ( interupted )
                phs.interuptStage('fight','assignekills',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'ys' ) ))
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
            interupted = [G.state.choices.fight.enemy,G.state.choices.fight.player].find( p => p.faction.name == 'ys' ) && G.units.find( u => u.type == 'Hastur').place == G.state.choices.fight.place
            if ( interupted )
                phs.interuptStage('fight','assignpkills',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'ys' ) ))
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