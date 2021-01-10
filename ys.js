let G
let phs
let faction = (g,p) => {
    G = g;
    phs = p
    let books = ["He Who Must Not Be Named","Passion","Shriek of the Byakhee","The Screaming Dead","The Third Eye","Zin Gaya",]
    let bookinit = {
        "He Who Must Not Be Named":f=>{},
        "Passion":f=>{},
        "Shriek of the Byakhee":f=>{},
        "The Screaming Dead":f=>{},
        "The Third Eye":f=>{},
        "Zin Gaya":f=>{}
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
    
    // yellow
    // desecrate = () => {}
    // gift3power = () => {}
    // named = () => {}
    // shriek = () => {}
    // scream = () => {}
    // zingaya = () => {}
    // vengence = () => {}

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
    
    let named = () => phs.addPhase('named',{
        unlim,
        req : f => G.player.faction.name == 'ys' && G.places[G.player.units.find( u => u.type = 'Hastur' ).place] && !G.player.temp.turn.named && !G.player.temp.turn.scream && player.power > 0,
        start : 'place',
        stages: {               
            place : {
                options : f=>Array.from( new Set(G.players.filter( p => p.faction.name != 'ys' ).units.filter( u => u.type == 'cult' ).map( u => u.place ) ) ),
                moves : {
                    choose : (np, c) => {
                        if ( ( np == 'place' || np == 'named' ) && Array.from( new Set(G.players.filter( p => p.faction.name != 'ys' ).units.filter( u => u.type == 'cult' ).map( u => u.place ) ) ).includes(c)) {
                            G.player.temp.turn.named = 1
                            G.player.units.find( u => u.type = 'Hastur' ).place = c
                            G.player.power--
                            phs.endPhase()
                        }
                    }
                }
            }
        }
    })

    let shriek = () => {
        G.choices.shriek = {place:null}
        phs.addPhase('shriek',{
            lim,
            req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'Byakhee' && G.places[u.place]) && player.power > 0,
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
            req : f => G.player.faction.name == 'ys' && G.player.units.find( u => u.type == 'Undead' && u.place == '' ) && G.player.units.find( u => u.type == 'Undead' && G.places[u.place] && G.units.find( uu => uu.owner.faction.name != 'ys' && uu.type == 'cult' && uu.place == u.place) ) && player.power > 0,
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

    // unique:zingaya (1) undead in same area turn enemy cult into undead
    // req : G.player.power > 0 && G.player.units.find( u => u.type == 'cult' && u.place == '' ) && G.player.units.find( u => u.type=='Undead' && G.units.find( uu => uu.type =='cult' && uu.owner.faction.name != 'ys' && uu.place == u.place ) )
    
    // unique:desecrate (2) if king roll less than pieces put token more than pieces put piece cost less than 2
    // roll
    // success -> place.glyphs.push(desecrationtoken)
    // fail -> unit ( cost <= 2 && place == '' )

    // unique:scream (1) move king and undead. turn off named. free actions
    // unlim
    // req : !G.player.named && !G.player.scream && king.place && poewr > 0
    // stages : unit(s), place

    // gatherpower:feast 
    // +1 per unit with desecration token in same place
    
    // death|capture:yourcultist gain 1 power
    // let cultist
    // at the start of each action phase
    // if cultists on board less than cultist
    //    power += culsists - cultistsonboard
    //    culstis = culstistsonboard

    // desecrate:thirdeye if hastur then gain 1 power and eldersign
    // desecrat.addStage( after 'success' ) 
    // if hastur, G.player.power++, G.player.signs++

    // assigncombat:hastur decides assignments
    // fight.addStage( before assignekills && before assignpkills )
    //   take control by branching to different kill assignment stage, so as hand it back properly
    //     on hand back -> set stage as assign(e/p)kills, return, then endStage 
    //       -- or -- 
    //     return, endStage(), if stage includes assign & kills, endStage() again

    let faction = {bookinit,books,bookreqs,goo,mons,color,start,name,units,addUnit,initUnits}
    return faction
}
export default faction