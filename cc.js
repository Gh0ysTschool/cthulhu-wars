let G, phs, H
let faction = (g,p,h) => {
    G = g
    phs = p
    H = h
    let books = ["Abduct","Emissary of the Outer Gods","Invisibility","Madness","Seek and Destroy","The Thousand Forms"]
    let bookinit = ["Abduct","Emissary of the Outer Gods","Invisibility","Madness","Seek and Destroy","The Thousand Forms"]
    // {
    //     "Abduct":abduct,
    //     "Emissary of the Outer Gods":emissary,
    //     "Invisibility":invisibility,
    //     "Madness":madness,
    //     "Seek and Destroy":seekanddestroy,
    //     "The Thousand Forms":thousandforms
    // }
    
    H["Abduct"]=abduct
    H["Emissary of the Outer Gods"]=emissary
    H["Invisibility"]=invisibility
    H["Madness"]=madness
    H["Seek and Destroy"]=seekanddestroy
    H["The Thousand Forms"]=thousandforms
    let bookreqs = [
        'pay 4 power',
        'pay 6 power',
        '3 gates / 12 power',
        '4 gates / 16 power',
        'capture',
        "Awaken Nyarlathotap",
        // {'pay 4 power':f=>false },
        // {'pay 6 power':f=>false },
        // {'3 gates / 12 power':f=> G.player.units.filter( u => u.gate ).length > 2 || G.player.power > 11 },
        // {'4 gates / 16 power':f=> G.player.units.filter( u => u.gate ).length > 3 || G.player.power > 15 },
        // {'capture':f=> units.filter( u => u.place == G.player.faction).length },
        // {"Awaken Nyarlathotap":f=> G.state.choices.awaken.unit?.type=='Nyarlathotap'},
    ]
    H['pay 4 power']=f=>false 
    H['pay 6 power']=f=>false 
    H['3 gates / 12 power']=f=> G.player.units.filter( u => u.gate ).length > 2 || G.player.power > 11 
    H['4 gates / 16 power']=f=> G.player.units.filter( u => u.gate ).length > 3 || G.player.power > 15 
    H['capture']=f=> units.filter( u => u.place == G.player.faction).length 
    H["Awaken Nyarlathotap"]=f=> G.state.choices.awaken.unit?.type=='Nyarlathotap'
    let color = 'blue'
    let start = 'southasia'
    let name = 'cc'
    let units = []
    
    let awakennarl = {
        awakenplaces: () => G.player.units.filter( u => u.gate ).map( u => u.place ),
        awakenreq: () => G.player.power > 9 && G.player.units.filter( u => u.gate ).length,
        cost: () => { G.player.power-=10; phs.endStage(); },
    }
    H['Nyarlathotap']=awakennarl
    let initUnits = p => {
        p.units = [
            ...p.units,
            {...H.unit("Nyarlathotap",name,'',10,()=>p.books.length + G.state.choices.fight.enemy.books.length,2),...awakennarl},
            ...[0,1,3].map( f=> H.unit('Nightgaunt',name,'',1,0,1)),
            ...[0,1,2].map( f=> H.unit('Flying Polyp',name,'',2,1,1)),
            ...[0,1].map( f=> H.unit('Hunting Horror',name,'',3,2,1)),
        ]
        flight()
    }
    let faction = {bookinit,books,bookreqs,color,start,name,units,initUnits}
    pay4()
    pay6()
    pay10()
    harbinger()
    return faction
}

let lim = 1, unlim = 1
let hasBookReq = ( b ) => G.player.faction.bookreqs.includes( o )
let pay4 = () => phs.addPhase('pay 4 power',{
    req : f => G.player.faction.name == 'cc' && G.player.power > 3 && hasBookReq('pay 4 power'),
    init : f => {G.player.power -= 4; H['pay 4 power'] = F=>true; endStage() }
})
let pay6 = () => phs.addPhase('pay 6 power',{
    req : f => G.player.faction.name == 'cc' && G.player.power > 5 && hasBookReq('pay 6 power'),
    init : f => {G.player.power -= 6; H['pay 6 power'] = F=>true; endStage() }
})
let pay10 = () => phs.addPhase('pay 10 power',{
    req : f => G.player.faction.name == 'cc' && G.player.power > 9 && hasBookReq('pay 4 power') && hasBookReq('pay 6 power'),
    init : f => {G.player.power -= 10; H['pay 4 power'] = F=>true;H['pay 6 power'] = F=>true; endStage() }
})
let harbinged = []
let involved = false
let harbinger = () => {
    phs.addStage('harb0',{
        init : f => {
            involved = [G.state.choices.fight.player,G.state.choices.fight.enemy].find( p => p.faction.name == 'cc')?.units.find( u => u.type == 'Nyarlathotap').place == G.state.choices.fight.place;
            if(involved && G.state.choices.fight.unit.tier >= 2) harbinged.push(G.state.choices.fight.unit);phs.endStage()},
    },'fight','assignpkills')
    phs.addStage('harb1',{
        init : f => {if(involved && G.state.choices.fight.unit.tier >= 2) harbinged.push(G.state.choices.fight.unit);phs.endStage()},
    },'fight','assignpretreats')
    phs.addStage('harb2',{
        init : f => {if(involved && G.state.choices.fight.unit.tier >= 2) harbinged.push(G.state.choices.fight.unit);phs.endStage()},
    },'fight','assigneretreats')
    phs.addStage('harb3',{
        init : f => {if(involved && G.state.choices.fight.unit.tier >= 2) harbinged.push(G.state.choices.fight.unit);phs.endStage()},
    },'fight','assignekills')
    phs.addStage('harbresolve',{
        init : f => {if(involved && harbinged.length) phs.interuptStage('fight','harbresolve',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'cc'))) },
        options : f => harbinged.map( h => ['+2 signs '+h.type,h.cost/2+' power  '+h.type]),
        moves : {
            choose : (np,c) => {
                if ( !harbinged.map( h => ['+2 signs',h.cost/2+' power']).includes(c)) return
                if ( c.includes('+2 signs')) G.player.signs++
                if ( c.includes( ' power ')) G.player.power += Number(c.split('')[0])
                harbinged = harbinged.filter( u => u.type != c.split('').slice(8).join('') )
                if (!harbinged.length) { phs.returnStage(); if (G.state.stage == 'harbresolve') phs.endStage() }
            }
        }
    },'fight','placeeretreats')
}
let seekanddestroy = () => phs.addStage('seek and destroy',{
    init : f => {
        involved = [G.state.choices.fight.player,G.state.choices.fight.enemy].find( p => p.faction.name == 'cc')?.units.find( u => u.type == 'Nyarlathotap').place == G.state.choices.fight.place;
        if (!G.player.units.filter( u => u.type == 'Hunting Horror' && G.state.places[u.place] ).length ) {phs.endStage();return;}
        phs.interuptStage('fight','seek and destroy',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'cc' ) ) )
    },
    options : f => G.player.units.filter( u => u.type == 'Hunting Horror' && G.state.places[u.place] ),
    moves : {
        choose : (np,c) => {
            if ( np != 'unit' || np != 'seek and destroy' || !G.player.units.filter( u => u.type == 'Hunting Horror' && G.state.places[u.place] ).includes(c)) return
            c.place = G.state.choices.fight.place
            if (!G.player.units.filter( u => u.type == 'Hunting Horror' && G.state.places[u.place] ).length) {
                phs.returnStage();
                phs.endStage();
            }
        },
        done : f => {phs.returnStage();phs.endStage();}
    }

},'fight','enemy')

let madness = () => {
    let madphase = {
        init : f => {
            phs.interuptStage('fight','placeeretreats',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'cc' ) ))
        },
        options : f => G.state.places[G.state.choices.fight.unit.place].adjacent.filter( p => !G.state.choices.fight.enemy.units.map( u => u.place ).includes(p)),
        moves : {
            choose : (np, c) => {
                if ( G.state.places[G.state.choices.fight.unit.place].adjacent.filter( p => !G.state.choices.fight.enemy.units.map( u => u.place ).includes(p)).includes( c ) ) {
                    G.state.choices.fight.unit.place = c
                    G.state.choices.fight.temp.phase.pains--
                    H.forceRerender()
                }
                if ( !G.state.choices.fight.player.temp.phase.pains || !G.state.choices.fight.player.units.filter( u => u.place == G.state.choices.fight.place ).length )  {
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
            phs.interuptStage('fight','placeeretreats',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'cc' ) ))
        },
        options : f => G.state.places[choices.fight.unit.place].adjacent.filter( p => !G.state.choices.fight.player.units.map( u => u.place ).includes(p)),
        moves : {
            choose : (np, c) => {
                if ( G.state.places[choices.fight.unit.place].adjacent.filter( p => !G.state.choices.fight.player.units.map( u => u.place ).includes(p)).includes( c ) ) {
                    G.state.choices.fight.unit.place = c
                    G.state.choices.fight.enemy.temp.phase.pains--
                    H.forceRerender()
                }
                if ( !G.state.choices.fight.enemy.pains || !G.state.choices.fight.enemy.units.filter( u => u.place == G.state.choices.fight.place ).length ) {
                    phs.returnStage(); phs.endStage()
                    G.state.choices.fight.place = null
                    G.state.choices.fight.enemy = null
                    G.state.choices.fight.unit = null
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
        G.state.players.find( p => p.faction.name == 'cc' ).units.find( u => u.type == 'Nyarlathtap' ).invulnerable = (
            !G.state.choices.fight.enemy.units.find( u => H.findPlyr(u.owner).faction.name != 'cc' && u.tier == 2 && u.place == G.state.choices.fight.place) ||
            !G.state.choices.fight.player.units.find( u => H.findPlyr(u.owner).faction.name != 'cc' && u.tier == 2 && u.place == G.state.choices.fight.place)
        )
        phs.endStage()
    },
},'fight','roll')
let invis = 0
let invisibility = () => {
    phs.addStage('invisunit',{
        init : f => {
            if ( G.state.choices.fight.player.faction.name != 'cc' && G.state.choices.fight.enemy.faction.name != 'cc' ) {phs.endStage(); return}
            phs.interuptStage('fight','invisunit',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'cc' ) ))
            invis = G.units.filter( u => u.type == 'Flying Polyp' && u.place == G.state.choices.fight.place )
        },
        options : f => [...G.state.choices.fight.player.units,...G.state.choices.fight.enemy.units,].filter( u => u.place == G.state.choices.fight.place ),
        moves : {
            choose : (np,c) => {
                if (np != 'unit' || np != 'invisunit' || ![...G.state.choices.fight.player.units,...G.state.choices.fight.enemy.units,].filter( u => u.place == G.state.choices.fight.place ).includes(c) ) return
                c.place = 'invisible'
                invis--
                H.forceRerender()
                if (!invis) {phs.returnStage();phs.endStage();}
            },
            done : f => {phs.returnStage();phs.endStage();},
        }
    },'fight','roll')
    phs.addStage('invisreturn',{
        init : f => {
            G.units.filter( u.place == 'invisible' ).map( u => u.place = G.state.choices.fight.place )
            endStage()
        }
    },'fight','placeeretreats')
}
let abductions = 0
let abduct = () => {
    phs.addStage('abductunit',{
        init : f => {
            if ( G.state.choices.fight.player.faction.name != 'cc' && G.state.choices.fight.enemy.faction.name != 'cc' ) {phs.endStage(); return}
            phs.interuptStage('fight','abductunit',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'cc' ) ))
            abductions = 0
        },
        options : f => [...G.state.choices.fight.player.units,...G.state.choices.fight.enemy.units,].filter( u => u.type == 'Nightgaunt' && u.place == G.state.choices.fight.place ),
        moves : {
            choose : (np,c) => {
                if (np != 'unit' || np != 'abductunit' || ![...G.state.choices.fight.player.units,...G.state.choices.fight.enemy.units,].filter( u => u.place == G.state.choices.fight.place ).includes(c) ) return
                c.place = ''
                abductions++
                if (![...G.state.choices.fight.player.units,...G.state.choices.fight.enemy.units,].filter( u => u.type == 'Nightgaunt' && u.place == G.state.choices.fight.place ).length) {phs.returnStage();phs.endStage();}
                else H.forceRerender()
            },
            done : f => {phs.returnStage();phs.endStage();},
        }
    },'fight','enemy')
    phs.addStage('abductenemyunit',{
        init : f => {
            if ( G.state.choices.fight.player.faction.name != 'cc' && G.state.choices.fight.enemy.faction.name != 'cc' ) {phs.endStage(); return}
            let p = [G.state.choices.fight.player.units,G.state.choices.fight.enemy].find( p => p.faction.name != 'cc')
            phs.interuptStage('fight','abductenemyunit',G.state.players.indexOf(p))
            abductions = 0
        },
        options : f => [G.state.choices.fight.player.units,G.state.choices.fight.enemy].find( p => p.faction.name != 'cc').units.filter( u => u.place == G.state.choices.fight.place && u.tier < 2 ),
        moves : {
            choose : (np,c) => {
                if (np != 'unit' || np != 'abductenemyunit' || ![G.state.choices.fight.player.units,G.state.choices.fight.enemy].find( p => p.faction.name != 'cc').units.filter( u => u.place == G.state.choices.fight.place && u.tier < 2 ).includes(c) ) return
                c.place = ''
                abductions--
                if (!abductions || ![G.state.choices.fight.player.units,G.state.choices.fight.enemy].find( p => p.faction.name != 'cc').units.filter( u => u.place == G.state.choices.fight.place && u.tier < 2 ).length) {phs.returnStage();phs.endStage();}
                else H.forceRerender()
            },
        }
    },'fight','abductunit')
}
let flight = () => {
    G.state.players.find( p => p.faction.name == 'cc' ).units.map( u => u.speed = 2 )
} 
let thousandformspower = 0
let thousandforms = f => {
    lim,
    G.state.choices.thousandforms = { once : 1, roll : 0, offers : [], tries : 3, negotiated : 0 }
    phs.addPhase('thousand forms',{
        req : f => G.state.choices.thousandforms.once && G.player.faction.name == 'cc' &&  hasBookReq('The Thousand Forms'),
        init : f => { 
            G.state.choices.thousandforms.roll = roll(G.state.places.filter( p => G.player.units.filter( u => u.type == 'Fungi' ).map( u => u.place).includes(p) ).length )
            G.state.choices.thousandforms.offers = Array(G.state.players.length).fill(0)
            G.state.turn.pi++
            G.state.choices.thousandforms.once = 0
        },
        start : 'negotiate',
        stages: {               
            negotiate : {
                next : 'power',
                options : f => Array(G.state.choices.thousandforms.roll+1).fill(0).map( (l,i) => i).filter( l => l < G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).length ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'negotiate' && Array(G.state.choices.thousandforms.roll+1).fill(0).map( (l,i) => i).filter( l => l <= G.player.power ).includes(c) ) {
                            G.state.choices.thousandforms.offers[G.state.turn.pi%G.state.players.length] = c
                            G.state.turn.pi++
                            if ( G.state.players[G.state.turn.pi].faction.name=='cc') {
                                tries--
                                G.state.choices.thousandforms.negotiated = (G.state.choices.thousandforms.offers.reduce((acc,cur)=>acc+cur,0) >= G.state.choices.thousandforms.roll )
                            }
                            if (!G.state.choices.thousandforms.tries || G.state.choices.thousandforms.negotiated) setStage( (G.state.choices.thousandforms.negotiated) ? 'losepower' : 'gainpower')
                            H.forceRerender()
                        }
                        
                    },
                }
            },             
            losepower : {
                init : f => {
                    G.pllayers.map( (p,i) => p.power -= G.state.choices.thousandforms.offers[i] )
                    phs.endStage()
                },
            },             
            gainpower : {
                init : f => {
                    G.player.power += G.state.choices.thousandforms.roll
                    phs.endStage()
                },
            }
        }
    } ) 
}
export default faction