let G
let phs
let faction = (g,p) => {
    G = g;
    phs = p
    let books = ["Abduct","Emissary of the Outer Gods","Invisibility","Madness","Seek and Destroy","The Thousand Forms"]
    let bookinit = {
        "Abduct":abduct,
        "Emissary of the Outer Gods":emissary,
        "Invisibility":invisibility,
        "Madness":madness,
        "Seek and Destroy":seekanddestroy,
        "The Thousand Forms":thousandforms
    }
    let bookreqs = [
        {'pay 4 pwoer':f=>false },
        {'pay 6 pwoer':f=>false },
        {'3 gates / 12 power':f=> G.player.units.filter( u => u.gate ).length > 2 || G.player.power > 11 },
        {'4 gates / 16 power':f=> G.player.units.filter( u => u.gate ).length > 3 || G.player.power > 15 },
        {'capture':f=> units.filter( u => u.place == G.player.faction).length },
        {"Awaken Nyarlathotap":f=> G.choices.awaken.unit?.name=='Nyarlathotap'},
    ]
    let goo = 'Nyarlathotap'
    let mons = {Nightgaunt:3,"Hunting Horror":2,"Flying Polyp":3}
    let color = 'blue'
    let start = 'southasia'
    let name = 'cc'
    let units = []
    let addUnit = (u,p) => {
        u.owner = p
        p.units = [...p.units,u]
    }
    
    let awakennarl = {
        awakenplaces: () => G.player.units.filter( u => u.gate ).map( u => u.place ),
        awakenreq: () => G.player.power > 9 && G.player.units.filter( u => u.gate ).length,
        cost: () => { G.player.power-=10; phs.endStage(); },
    }
    
    let initUnits = p => {
        p.units = [
            ...p.units,
            {...G.unit("Nyarlathotap",p,'',10,()=>p.books.length + G.choices.fight.enemy.books.length,2),...awakennarl},
            ...[0,1,3].map( f=> G.unit('Nightgaunt',p,'',1,0,1)),
            ...[0,1,2].map( f=> G.unit('Flying Polyp',p,'',2,1,1)),
            ...[0,1].map( f=> G.unit('Hunting Horror',p,'',3,2,1)),
        ]
        flight()
    }
    let faction = {bookinit,books,bookreqs,goo,mons,color,start,name,units,addUnit,initUnits}
    pay4()
    pay6()
    pay10()
    harbinger()
    return faction
}

let lim = 1, unlim = 1
let hasBookReq = ( b ) => G.player.faction.bookreqs.find( o => Object.keys(o).includes(b) )
let pay4 = () => phs.addPhase('pay 4 power',{
    req : f => G.player.faction.name == 'cc' && G.player.power > 3 && hasBookReq('pay 4 power'),
    init : f => {G.player.power -= 4; G.player.bookreqs[G.player.bookreqs.indexOf(hasBookReq('pay 4 power'))] = {'pay 4 power':F=>true}; endStage() }
})
let pay6 = () => phs.addPhase('pay 6 power',{
    req : f => G.player.faction.name == 'cc' && G.player.power > 5 && hasBookReq('pay 6 power'),
    init : f => {G.player.power -= 6; G.player.bookreqs[G.player.bookreqs.indexOf(hasBookReq('pay 6 power'))] = {'pay 6 power':F=>true}; endStage() }
})
let pay10 = () => phs.addPhase('pay 10 power',{
    req : f => G.player.faction.name == 'cc' && G.player.power > 9 && hasBookReq('pay 4 power') && hasBookReq('pay 6 power'),
    init : f => {G.player.power -= 10; G.player.bookreqs[0] = {'pay 4 power':F=>true}; G.player.bookreqs[1] = {'pay 6 power':F=>true}; endStage() }
})
let harbinged = []
let involved = false
let harbinger = () => {
    phs.addStage('harb0',{
        init : f => {
            involved = [G.choices.fight.player,G.choices.fight.enemy].find( p => p.faction.name == 'cc')?.units.find( u => u.type == 'Nyarlathotap').place == G.choices.fight.place;
            if(involved && G.choices.fight.unit.tier >= 2) harbinged.push(G.choices.fight.unit);phs.endStage()},
    },'fight','assignpkills')
    phs.addStage('harb1',{
        init : f => {if(involved && G.choices.fight.unit.tier >= 2) harbinged.push(G.choices.fight.unit);phs.endStage()},
    },'fight','assignpretreats')
    phs.addStage('harb2',{
        init : f => {if(involved && G.choices.fight.unit.tier >= 2) harbinged.push(G.choices.fight.unit);phs.endStage()},
    },'fight','assigneretreats')
    phs.addStage('harb3',{
        init : f => {if(involved && G.choices.fight.unit.tier >= 2) harbinged.push(G.choices.fight.unit);phs.endStage()},
    },'fight','assignekills')
    phs.addStage('harbresolve',{
        init : f => {if(involved && harbinged.length) phs.interuptStage('fight','harbresolve',G.players.indexOf(G.players.find( p => p.faction.name == 'cc'))) },
        options : f => harbinged.map( h => ['+2 signs '+h.type,h.cost/2+' power  '+h.type]),
        moves : {
            choose : (np,c) => {
                if ( !harbinged.map( h => ['+2 signs',h.cost/2+' power']).includes(c)) return
                if ( c.includes('+2 signs')) G.player.signs++
                if ( c.includes( ' power ')) G.player.power += Number(c.split('')[0])
                harbinged = harbinged.filter( u => u.type != c.split('').slice(8).join('') )
                if (!harbinged.length) { phs.returnStage(); if (G.stage == 'harbresolve') phs.endStage() }
            }
        }
    },'fight','placeeretreats')
}
let seekanddestroy = () => phs.addStage('seek and destroy',{
    init : f => {
        involved = [G.choices.fight.player,G.choices.fight.enemy].find( p => p.faction.name == 'cc')?.units.find( u => u.type == 'Nyarlathotap').place == G.choices.fight.place;
        if (!G.player.units.filter( u => u.type == 'Hunting Horror' && G.places[u.place] ).length ) {phs.endStage();return;}
        phs.interuptStage('fight','seek and destroy',G.players.indexOf(G.players.find( p => p.faction.name == 'cc' ) ) )
    },
    options : f => G.player.units.filter( u => u.type == 'Hunting Horror' && G.places[u.place] ),
    moves : {
        choose : (np,c) => {
            if ( np != 'unit' || np != 'seek and destroy' || !G.player.units.filter( u => u.type == 'Hunting Horror' && G.places[u.place] ).includes(c)) return
            c.place = G.choices.fight.place
            if (!G.player.units.filter( u => u.type == 'Hunting Horror' && G.places[u.place] ).length) {
                phs.returnStage();
                phs.endStage();
            }
        },
        done : f => {phs.returnStage();phs.endStage();}
    }

},'fight','enemy')

let madness = () => {
    madphase = {
        init : f => {
            phs.interuptStage('fight','placeeretreats',G.players.indexOf(G.players.find( p => p.faction.name == 'cc' ) ))
        },
        options : f => G.places[G.choices.fight.unit.place].adjacent.filter( p => !G.choices.fight.enemy.units.map( u => u.place ).includes(p)),
        moves : {
            choose : (np, c) => {
                if ( G.places[G.choices.fight.unit.place].adjacent.filter( p => !G.choices.fight.enemy.units.map( u => u.place ).includes(p)).includes( c ) ) {
                    G.choices.fight.unit.place = c
                    G.choices.fight.temp.phase.pains--
                    G.forceRerender()
                }
                if ( !G.choices.fight.player.temp.phase.pains || !G.choices.fight.player.units.filter( u => u.place == G.choices.fight.place ).length )  {
                    phs.returnStage()
                    phs.endStage()
                } else{
                    phs.returnStage()
                    phs.setStage('assignpretreats')
                }
            }
        }
    }
    G.phases.fight.stages.placepretreats = {...madphase,next:'assignekills'}
    G.phases.fight.stages.placeeretreats = {
        init : f => {
            phs.interuptStage('fight','placeeretreats',G.players.indexOf(G.players.find( p => p.faction.name == 'cc' ) ))
        },
        options : f => G.places[choices.fight.unit.place].adjacent.filter( p => !G.choices.fight.player.units.map( u => u.place ).includes(p)),
        moves : {
            choose : (np, c) => {
                if ( G.places[choices.fight.unit.place].adjacent.filter( p => !G.choices.fight.player.units.map( u => u.place ).includes(p)).includes( c ) ) {
                    G.choices.fight.unit.place = c
                    G.choices.fight.enemy.temp.phase.pains--
                    G.forceRerender()
                }
                if ( !G.choices.fight.enemy.pains || !G.choices.fight.enemy.units.filter( u => u.place == G.choices.fight.place ).length ) {
                    phs.returnStage(); phs.endStage()
                    G.choices.fight.place = null
                    G.choices.fight.enemy = null
                    G.choices.fight.unit = null
                } else {
                    phs.returnStage()
                    phs.setStage('assignpretreats')
                }
            }
        }
    }
}
let emissary = () => phs.addStage('emissary',{
    init : f => {
        G.players.find( p => p.faction.name == 'cc' ).units.find( u => u.type == 'Nyarlathtap' ).invulnerable = (
            !G.choices.fight.enemy.units.find( u => u.owner.faction.name != 'cc' && u.tier == 2 && u.place == G.choices.fight.place) ||
            !G.choices.fight.player.units.find( u => u.owner.faction.name != 'cc' && u.tier == 2 && u.place == G.choices.fight.place)
        )
        phs.endStage()
    },
},'fight','roll')
let invis = 0
let invisibility = () => {
    phs.addStage('invisunit',{
        init : f => {
            if ( G.choices.fight.player.faction.name != 'cc' && G.choices.fight.enemy.faction.name != 'cc' ) {phs.endStage(); return}
            phs.interuptStage('fight','invisunit',G.players.indexOf(G.players.find( p => p.faction.name == 'cc' ) ))
            invis = G.units.filter( u => u.type == 'Flying Polyp' && u.place == G.choices.fight.place )
        },
        options : f => [...G.choices.fight.player.units,...G.choices.fight.enemy.units,].filter( u => u.place == G.choices.fight.place ),
        moves : {
            choose : (np,c) => {
                if (np != 'unit' || np != 'invisunit' || ![...G.choices.fight.player.units,...G.choices.fight.enemy.units,].filter( u => u.place == G.choices.fight.place ).includes(c) ) return
                c.place = 'invisible'
                invis--
                G.forceRerender()
                if (!invis) {phs.returnStage();phs.endStage();}
            },
            done : f => {phs.returnStage();phs.endStage();},
        }
    },'fight','roll')
    phs.addStage('invisreturn',{
        init : f => {
            G.units.filter( u.place == 'invisible' ).map( u => u.place = G.choices.fight.place )
            endStage()
        }
    },'fight','placeeretreats')
}
let abductions = 0
let abduct = () => {
    phs.addStage('abductunit',{
        init : f => {
            if ( G.choices.fight.player.faction.name != 'cc' && G.choices.fight.enemy.faction.name != 'cc' ) {phs.endStage(); return}
            phs.interuptStage('fight','abductunit',G.players.indexOf(G.players.find( p => p.faction.name == 'cc' ) ))
            abductions = 0
        },
        options : f => [...G.choices.fight.player.units,...G.choices.fight.enemy.units,].filter( u => u.type == 'Nightgaunt' && u.place == G.choices.fight.place ),
        moves : {
            choose : (np,c) => {
                if (np != 'unit' || np != 'abductunit' || ![...G.choices.fight.player.units,...G.choices.fight.enemy.units,].filter( u => u.place == G.choices.fight.place ).includes(c) ) return
                c.place = ''
                abductions++
                if (![...G.choices.fight.player.units,...G.choices.fight.enemy.units,].filter( u => u.type == 'Nightgaunt' && u.place == G.choices.fight.place ).length) {phs.returnStage();phs.endStage();}
                else G.forceRerender()
            },
            done : f => {phs.returnStage();phs.endStage();},
        }
    },'fight','enemy')
    phs.addStage('abductenemyunit',{
        init : f => {
            if ( G.choices.fight.player.faction.name != 'cc' && G.choices.fight.enemy.faction.name != 'cc' ) {phs.endStage(); return}
            let p = [G.choices.fight.player.units,G.choices.fight.enemy].find( p => p.faction.name != 'cc')
            phs.interuptStage('fight','abductenemyunit',G.players.indexOf(p))
            abductions = 0
        },
        options : f => [G.choices.fight.player.units,G.choices.fight.enemy].find( p => p.faction.name != 'cc').units.filter( u => u.place == G.choices.fight.place && u.tier < 2 ),
        moves : {
            choose : (np,c) => {
                if (np != 'unit' || np != 'abductenemyunit' || ![G.choices.fight.player.units,G.choices.fight.enemy].find( p => p.faction.name != 'cc').units.filter( u => u.place == G.choices.fight.place && u.tier < 2 ).includes(c) ) return
                c.place = ''
                abductions--
                if (!abductions || ![G.choices.fight.player.units,G.choices.fight.enemy].find( p => p.faction.name != 'cc').units.filter( u => u.place == G.choices.fight.place && u.tier < 2 ).length) {phs.returnStage();phs.endStage();}
                else G.forceRerender()
            },
        }
    },'fight','abductunit')
}
let flight = () => {
    G.players.find( p => p.faction.name == 'cc' ).units.map( u => u.speed = 2 )
} 
let thousandformspower = 0
let thousandforms = f => {
    lim,
    G.choices.thousandforms = { once : 1, roll : 0, offers : [], tries : 3, negotiated : 0 }
    phs.addPhase('thousand forms',{
        req : f => G.choices.thousandforms.once && G.player.faction.name == 'cc' &&  hasBookReq('The Thousand Forms'),
        init : f => { 
            G.choices.thousandforms.roll = roll(G.places.filter( p => G.player.units.filter( u => u.type == 'Fungi' ).map( u => u.place).includes(p) ).length )
            G.choices.thousandforms.offers = Array(G.players.length).fill(0)
            G.turn.pi++
            G.choices.thousandforms.once = 0
        },
        start : 'negotiate',
        stages: {               
            negotiate : {
                next : 'power',
                options : f => Array(G.choices.thousandforms.roll+1).fill(0).map( (l,i) => i).filter( l => l < G.player.units.filter( u => u.type == 'cult' && Object.keys(G.places).includes(u.place) ).length ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'negotiate' && Array(G.choices.thousandforms.roll+1).fill(0).map( (l,i) => i).filter( l => l <= G.player.power ).includes(c) ) {
                            G.choices.thousandforms.offers[G.turn.pi%G.players.length] = c
                            G.turn.pi++
                            if ( G.players[G.turn.pi].faction.name=='cc') {
                                tries--
                                G.choices.thousandforms.negotiated = (G.choices.thousandforms.offers.reduce((acc,cur)=>acc+cur,0) >= G.choices.thousandforms.roll )
                            }
                            if (!G.choices.thousandforms.tries || G.choices.thousandforms.negotiated) setStage( (G.choices.thousandforms.negotiated) ? 'losepower' : 'gainpower')
                            G.forceRerender()
                        }
                        
                    },
                }
            },             
            losepower : {
                init : f => {
                    G.pllayers.map( (p,i) => p.power -= G.choices.thousandforms.offers[i] )
                    phs.endStage()
                },
            },             
            gainpower : {
                init : f => {
                    G.player.power += G.choices.thousandforms.roll
                    phs.endStage()
                },
            }
        }
    } ) 
}
export default faction