let G, lim = 1, unlim = 1, H
let findPlyr = (name) => G.state.players.find( p => p.faction.name == name)
let stealableUnitsIn = (p) => {
    let tmpunits = []
        tmpunits = G.units.filter( u => u.place == p )
        let dom = {}
        G.state.players.map( p => dom[p.faction.name] = 0)
        tmpunits.map( u => 
            dom[findPlyr(u.owner).faction.name] = (dom[findPlyr(u.owner).faction.name] < u.tier) 
            ? u.tier : dom[findPlyr(u.owner).faction.name]
        )
        tmpunits = tmpunits.filter( u => 
            u.tier == 0 && dom[findPlyr(u.owner).faction.name] < dom[G.player.faction.name] 
        )
        return tmpunits
}
let calcDamage = (p) => {
    let r = roll( p.units.filter( u => u.place == choices.fight.place ).map( u => typeof u.combat == 'function' ? u.combat() : u.combat ) )
    p.temp.phase.kills = r.filter( e => e > 4 ).length
    p.temp.phase.pains = r.filter( e => e < 5 && e > 2).length
}
let roll = ( dice=1 ) => Array.from(dice).fill(0).map( v => Math.floor((Math.random() * 6) + 1) ).reduce((acc,cur)=>acc+cur,0)
let endTurn = t => { 
    G.state.players.map( p => p.temp.turn = {} )
    if (!G.state.players.filter( p => p.power ).length) 
        phases.setPhase('gather')
    G.state.turn.lim=1; 
    G.state.turn.pi++;
    while(G.state.phase == 'action' && !G.state.players[G.state.turn.pi%G.state.players.length].power) 
        G.state.turn.pi++
    H.forceRerender();
}
let returnStage = f => {}
let interuptStage = (inphase,instage,inpi) => {
    let rphase = ''+G.state.phase
    let rstage = ''+G.state.stage
    let rpi = 0+G.state.turn.pi
    returnStage = phases.returnStage = f => {
        G.state.phase = rphase
        G.state.stage = rstage
        G.state.turn.pi = rpi
        H.forceRerender()
        if (G.state.phase == 'action' && !G.phases.action.stages.start.options().length) endTurn()
        else if (G.state.stage && !G.phases[G.state.phase].stages[G.state.stage].options().length) endStage()
        else if (G.phases[G.state.phase].options && !G.phases[G.state.phase].options().length) endStage()
    }
    G.state.phase = inphase
    G.state.stage = instage
    G.state.turn.pi = inpi
    H.forceRerender()
}
// let checkbooks = () => 
//     G.state.players.map( p => p.faction.bookreqs.map( (l,i) => {
//         if (Object.values(l)[0]()){
//             p.faction.bookreqs[i] = {'waiting...':f=>false}
//             interuptStage('book','book',G.state.players.indexOf(p))
//         }
//     }))
let checkbooks = () => 
    G.state.players.map( p => p.faction.bookreqs.map( (l,i) => {
        if (H[l]()){
            p.faction.bookreqs[i] = 'waiting...'
            interuptStage('book','book',G.state.players.indexOf(p))
        }
    }))
let lostGates = g => Object.keys(G.state.places).filter( p => G.state.places[p].gate && !G.units.filter( u => u.place == p && u.gate).length )
let autoMountGates = g => {
    lostGates().map( pl => {
        let stop = 0
        G.state.players.map( p => {
            let cults = p.units.filter( u => u.type == 'cult' && u.place == pl )
            if (cults.length && !stop) {
                cults[0].gate = pl
                stop = 1
            }
        })
        G.state.places[pl].nocults = !stop
    })
}
let phaseInit = () => {
    if (G.state.stage && G.phases[G.state.phase].stages[G.state.stage].init)
        G.phases[G.state.phase].stages[G.state.stage].init() 
    else if (G.state.stage == '' && G.phases[G.state.phase].init)
        G.phases[G.state.phase].init() 
    
}
let setStage = s => {G.state.stage = s; phaseInit(); H.forceRerender();}
let endStage = s => {autoMountGates(); if (G.phases[G.state.phase].stages[G.state.stage].next) {setStage(G.phases[G.state.phase].stages[G.state.stage].next)} else {endPhase();}}
let setPhase = p => {
    G.state.phase = p
    G.state.stage = G.phases[G.state.phase].start||''
    autoMountGates()
    checkbooks()
    phaseInit()
    H.forceRerender()
}
let endPhase = p => {
    G.state.players.map( p => p.temp.phase = {} )
    if (G.phases[G.state.phase].lim) 
        G.state.turn.lim--
    G.state.phase = (G.phases[G.state.phase].next) ? G.phases[G.state.phase].next : 'action';
    G.state.stage = G.phases[G.state.phase].start||''
    autoMountGates()
    checkbooks()
    phaseInit()
    H.forceRerender();
    if (G.state.phase == 'action' && !G.phases.action.stages.start.options().length) endTurn()
}
let addStage=(s,stage,phase,prev)=>{
    G.phases[phase].stages[s] = stage
    if (prev) {
        stage.next = ''+(G.phases[phase].stages[prev].next||'')
        G.phases[phase].stages[prev].next = s
    } //else G.phases[phase].start = s
}
let addPhase=(p,phase)=>{G.phases[p]=phase}
let phases = {
    addPhase,
    roll,
    addStage,
    interuptStage,
    endPhase,
    endStage,
    setPhase,
    setStage,
    returnStage,
    init : (g,h) => {
        G = g; H = h; G.phases = {...phases.phases};
        G.state.choices = {
            book : {
                book : null,
            },
            awaken : {
                unit : null,
                place : null,
            },
            move : {
                unit : null,
                place : null,
            },
            fight : {
                place : null,
                enemy : null,
            },
            hire : {
                place : null,
            },
            open : {
                place : null,
            },
            summon : {
                unit : null,
                place : null,
            },
            steal : {
                place : null,
                unit : null,
            },
        }
    },

    phases : {
        gather : {
            start : 'start',
            stages : {
                start : {
                    init : f => {
                        Object.keys(G.state.choices).map( k => {
                            if (G.state.choices[k].once !== undefined)
                                G.state.choices[k].once = 1
                        })
                        G.state.players.map( 
                            p => p.power += lostGates().length 
                            + p.units.filter(
                                u => (u.type == 'cult' || u.gatherer) 
                                && Object.keys(G.state.places).includes(u.place)
                            ).length 
                            + 2 
                            * p.units.filter( 
                                u => u.gate
                            ).length 
                            + G.units.filter( 
                                u => u.place == p.faction.name 
                            ).map( 
                                u => u.place = ''
                            ).length
                        );
                        let highest = G.player
                        G.state.players.map( p => highest = (p.power > highest.power) ? p : highest)
                        G.state.turn.pi = G.state.players.indexOf(highest)
                        G.state.players.map( p => p.power = (p.power < highest.power/2) ? highest.power/2 : p.power);
                    },
                    options : f => ['keep turn order','reverse turn order'],
                    moves : {
                        choose : (np,c) => {
                            let p = G.state.players[G.state.turn.pi%G.state.players.length]
                            console.log(c)
                            if( ['keep turn order','reverse turn order'].includes(c) ) {
                                if (c == 'reverse turn order') {
                                    G.state.players = G.state.players.reverse()
                                    G.state.turn.pi = G.state.players.indexOf(G.state.players.find( pp => pp.faction.name == p.faction.name))
                                }
                                G.state.players.map( p => p.ritual = 1)
                                setPhase('doom')
                            }
                        }
                    }
                },
            }
        },
        doom : {
            start : 'doom',
            stages : {
                doom : {
                    options : f => ['ritual',"don't ritual"],
                    moves : {
                        choose : (np,c) => {
                            if (np != 'doom') 
                                return
                            G.player.units.filter( u => u.gate ).map( f => G.player.doom++)
                            G.player.ritual = 0
                            if (c == 'ritual' && G.player.power >= G.ritualcost) {
                                G.player.units.filter( u => u.gate ).map( f => G.player.doom++)
                                G.player.units.filter( u => u.tier==2 ).map( f => G.player.signs++)
                                G.player.power -= G.ritualcost
                                G.rituals++
                            }
                            G.state.turn.pi++        
                            if (!G.state.players.filter( p => p.ritual).length) endStage()
                            H.forceRerender()
                        },
                        // done : (np,c) => { G.player.power = 0; endTurn(); }
                    }
                }
            }
        },
        action : {
            start : 'start',
            stages : {
                start : {
                    options : f => Object.keys(G.phases).filter( p => (G.phases[p].unlim || (G.phases[p].lim && G.state.turn.lim)) && (!G.phases[p].req || G.phases[p].req())),
                    moves : {
                        choose : (np,c) => {
                            if (np == 'start') setPhase(c)},
                        done : (np,c) => { G.player.power = 0; endTurn(); }
                    }
                }
            }
        },
        move : {
            lim,
            start : 'unit',
            stages: {               
                    unit : {
                        next : 'place',
                        options : f => G.player.units.filter( u => G.state.places[u.place] && !u.moved),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'unit' && G.player.units.filter( u => G.state.places[u.place] ).map( u => u.id ).includes(c.id) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                    G.state.choices.move.unit = c
                                    endStage()
                                }
                            },
                            done : f => {
                                endPhase()
                                G.player.units.map( u => u.moved = 0)
                            }
                        },
                    },
                    place : {
                        next : 'unit',
                        options : f => (G.state.choices.move?.unit?.speed == 2 ) ? Array.from( new Set(G.state.places[G.state.choices.move.unit.place].adjacent.reduce( (acc,p) => acc.concat(G.state.places[p].adjacent), []) ) ) : G.state.places[G.state.choices.move.unit.place].adjacent,
                        moves : {
                            choose : (np, c) => {
                                if (np == 'place' && ((G.state.choices.move.unit.speed == 2 ) ? Array.from( new Set(G.state.places[G.state.choices.move.unit.place].adjacent.reduce( (acc,p) => acc.concat(G.state.places[p].adjacent), []) ) ) : G.state.places[G.state.choices.move.unit.place].adjacent).includes(c)) {
                                    G.state.choices.move.place = c
                                    G.state.choices.move.unit.gate = 0
                                    G.state.choices.move.unit.place = c
                                    G.state.choices.move.unit.moved = 1
                                    G.player.power--
                                    H.forceRerender()
                                    if (G.player.power == 0) {
                                        endPhase()
                                        G.player.units.map( u => u.moved = 0)
                                    }
                                    else endStage()
                                }
                            }
                        },
                    },
                }
        },
        fight : {
            lim,
            start : 'place',
            req : f=>Object.keys(G.state.places).find( p => G.player.units.find( u => u.fight != 0 && u.place == p) && G.units.find( u => u.place == p && findPlyr(u.owner).faction.name != G.player.faction.name ) ),
            init : f => G.state.choices.fight.player = G.state.players[G.state.turn.pi],
            stages : {
                place : {
                    next : 'enemy',
                    options : f => Object.keys(G.state.places).filter( p => G.player.units.filter( u => u.place == p && u.fight != 0 ).length ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && Object.keys(G.state.places).filter( p => G.player.units.find( u => u.fight != 0 && u.place == p) && G.units.find( u => u.place == p && findPlyr(u.owner).faction.name != G.player.faction.name ) ).includes(c) ) {
                                G.state.choices.fight.place = c
                                endStage()
                            }
                        }
                    },
                },
                enemy : {
                    next : 'roll',
                    options : f => G.state.players.filter( p => p.faction.name != G.player.faction.name && p.units.filter( u => u.place == G.state.choices.fight.place).length ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'enemy' && G.state.players.filter( p => p.faction.name != G.player.faction.name && p.units.filter( u => u.place == G.state.choices.fight.place).length ) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                G.state.choices.fight.enemy = c
                                G.player.power--
                                endPhase()
                            }
                        }
                    },
                }, 
                roll : {
                    next : 'assignpkills',
                    init : f => { 
                        calcDamage(G.player)
                        calcDamage(G.state.choices.fight.enemy)
                        endPhase()
                    },
                    options : f => [],
                    moves : {
                        choose : (np,c) => {}
                    }
                },
                assignpkills : {
                    next : 'assignpretreats',
                    options : f => G.player.units.filter( u => u.place == G.state.choices.fight.place && (!u?.invulnerable ) ),
                    moves : {
                        choose : (np, c) => {
                            if ( G.player.units.filter( u => u.place == G.state.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                c.place = ''
                                c.gate = 0
                                G.player.temp.phase.kills--
                                H.forceRerender()
                            }
                            if ( !G.player.temp.phase.kills || !G.player.units.filter( u => u.place == G.state.choices.fight.place ).length ) 
                                endStage()
                        }
                    }
                },
                assignpretreats : {
                    next : 'placepretreats',
                    options : f => G.player.units.filter( u => u.place == G.state.choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( G.player.units.filter( u => u.place == G.state.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                G.choice.fight.unit = c
                                endStage()
                            }
                        }
                    }
                },
                placepretreats : {
                    next : 'assignekills',
                    options : f => G.state.places[G.state.choices.fight.unit.place].adjacent.filter( p => !G.state.choices.fight.enemy.units.map( u => u.place ).includes(p)),
                    moves : {
                        choose : (np, c) => {
                            if ( G.state.places[G.state.choices.fight.unit.place].adjacent.filter( p => !G.state.choices.fight.enemy.units.map( u => u.place ).includes(p)).includes( c ) ) {
                                G.state.choices.fight.unit.place = c
                                G.player.temp.phase.pains--
                                H.forceRerender()
                            }
                            if ( !G.player.temp.phase.pains || !G.player.units.filter( u => u.place == G.state.choices.fight.place ).length ) 
                                endStage()
                            else
                                setStage('assignpretreats')
                        }
                    }
                },
                assignekills : {
                    next : 'assigneretreats',
                    options : f => G.state.choices.fight.enemy.units.filter( u => u.place == G.state.choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( G.state.choices.fight.enemy.units.filter( u => u.place == G.state.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                c.place = ''
                                c.gate = 0
                                G.state.choices.fight.enemy.temp.phase.kills--
                                H.forceRerender()
                            }
                            if ( !G.state.choices.fight.enemy.kills || !G.state.choices.fight.enemy.units.filter( u => u.place == G.state.choices.fight.place ).length ) 
                                endStage()
                        }
                    }
                },
                assigneretreats : {
                    next : 'placeeretreats',
                    options : f => G.state.choices.fight.enemy.units.filter( u => u.place == G.state.choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( G.state.choices.fight.enemy.units.filter( u => u.place == G.state.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                G.choice.fight.unit = c
                                endStage()
                            }
                        }
                    }
                },
                placeeretreats : {
                    options : f => G.state.places[choices.fight.unit.place].adjacent.filter( p => !G.player.units.map( u => u.place ).includes(p)),
                    moves : {
                        choose : (np, c) => {
                            if ( G.state.places[choices.fight.unit.place].adjacent.filter( p => !player.units.map( u => u.place ).includes(p)).includes( c ) ) {
                                G.state.choices.fight.unit.place = c
                                G.state.choices.fight.enemy.temp.phase.pains--
                                H.forceRerender()
                            }
                            if ( !G.state.choices.fight.enemy.pains || !G.state.choices.fight.enemy.units.filter( u => u.place == G.state.choices.fight.place ).length ) {
                                endStage()
                                G.state.choices.fight.place = null
                                G.state.choices.fight.enemy = null
                                G.state.choices.fight.unit = null
                            } else
                                setStage('assignpretreats')
                        }
                    }
                }
            }
        },
        hire : {
            lim,
            start : 'place',
            req : f => G.player.units.find( u => u.type == 'cult' && u.place == '' ),
            stages : {
                place : {
                    options : f => Array.from( new Set( G.player.units.map( u => u.place ) ) ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && G.player.units.map( u => u.place ).includes(c) ) {
                                G.state.choices.hire.place = c
                                let u = G.player.units.find( u => u.place == '' && u.type == 'cult')
                                if (!u) setPhase('action')
                                u.place = c
                                G.player.power--
                                G.state.choices.hire.place = null
                                endPhase()
                            }
                        }
                    }
                },
            }
        },
        open : {
            lim,
            start : 'place',
            req : f => G.player.power > 2 && Object.keys(G.state.places).find( p => !G.units.find( u => u.gate == p) && G.player.units.find( u => u.place == p && u.type == 'cult' ) ),
            stages : {
                place : {
                    options : f => Object.keys(G.state.places).filter( p => !G.state.places[p].gate && G.player.units.filter( u => u.type == 'cult' ).map( u => u.place ).includes(p) ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && G.player.units.filter( u => u.type == 'cult' ).map( u => u.place ).includes(c) ) {
                                G.state.choices.open.place = c
                                G.state.places[G.state.choices.open.place].gate = 1
                                G.player.power-=3
                                endPhase()
                            }
                        }
                    }
                },
            }
        },
        summon : {
            lim,
            start : 'unit',
            stages : {
                unit : {
                    next : 'place',
                    options : f => G.player.units.filter( u => !G.state.places[u.place] && u.tier==1 && ((typeof u.cost == 'function') ? u.cost() : u.cost) <= G.player.power),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'unit' && !G.state.places[c.place] && c.cost <= G.player.power /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                G.state.choices.summon.unit = c
                                endStage()
                            }
                        },
                        done : f => {
                            endPhase()
                        }
                    },
                },
                place : {
                    options : f => G.player.units.filter( u => u.gate ).map( u => u.place ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && G.player.units.filter( u => u.gate ).map( u => u.place ).includes(c)) {
                                G.state.choices.summon.place = c
                                G.state.choices.summon.unit.place = c
                                G.player.power -= G.state.choices.summon.unit.cost
                                G.state.choices.summon.unit = null
                                G.state.choices.summon.place = null
                                H.forceRerender()
                                endStage()
                            }
                        }
                    },
                },
            }
        },
        // awaken : {
        //     lim,
        //     start : 'unit',
        //     req : f => G.player.units.filter( u => u.tier == 2 && u.place == '' && u.awakenreq()).length,
        //     stages : {
        //         unit : {
        //             next : 'place',
        //             options : f => G.player.units.filter( u => u.tier==2 && u.awakenreq()),
        //             moves : {
        //                 choose : (np, c) => {
        //                     if (np == 'unit' && G.player.units.filter( u => u.tier==2 && u.awakenreq()).includes(c)) {
        //                         G.state.choices.awaken.unit = c
        //                         endStage()
        //                     }
        //                 },
        //                 done : f => {
        //                     endPhase()
        //                 }
        //             },
        //         },
        //         place : {
        //             options : f => G.state.choices.awaken.unit.awakenplaces(),
        //             moves : {
        //                 choose : (np, c) => {
        //                     if (np == 'place' && G.state.choices.awaken.unit.awakenplaces().includes(c)) {
        //                         G.state.choices.awaken.place = c
        //                         G.state.choices.awaken.unit.place = c
        //                         // G.player.power -= G.state.choices.awaken.unit.cost
        //                         // G.state.choices.awaken.unit = null
        //                         // G.state.choices.awaken.place = null
        //                         G.state.choices.awaken.unit.cost()
        //                         H.forceRerender()
        //                         // endStage()
        //                     }
        //                 }
        //             },
        //         },
        //     }
        // },
        awaken : {
            lim,
            start : 'unit',
            req : f => G.player.units.filter( u => u.tier == 2 && u.place == '' && H[u.type].awakenreq()).length,
            stages : {
                unit : {
                    next : 'place',
                    options : f => G.player.units.filter( u => u.tier==2 && H[u.type].awakenreq()),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'unit' && G.player.units.filter( u => u.tier==2 && H[u.type].awakenreq()).includes(c)) {
                                G.state.choices.awaken.unit = c
                                endStage()
                            }
                        },
                        done : f => {
                            endPhase()
                        }
                    },
                },
                place : {
                    options : f => H[G.state.choices.awaken.unit.type].awakenplaces(),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && H[G.state.choices.awaken.unit.type].awakenplaces().includes(c)) {
                                G.state.choices.awaken.place = c
                                G.state.choices.awaken.unit.place = c
                                H[G.state.choices.awaken.unit.type].cost()
                                H.forceRerender()
                            }
                        }
                    },
                },
            }
        },
        steal : {
            lim,
            start : 'place',
            req : f => Object.keys(G.state.places).filter( p =>stealableUnitsIn(p).length ).length,
            stages : {
                place : {
                    next : 'unit',
                    options : f => Object.keys(G.state.places).filter( p =>stealableUnitsIn(p).length ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && stealableUnitsIn(c).length ) {
                                G.state.choices.steal.place = c
                                G.state.choices.steal.gate = 0
                                endStage()
                            }
                        }
                    },
                },
                unit : {
                    options : f => stealableUnitsIn(G.state.choices.steal.place),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'unit' && stealableUnitsIn(G.state.choices.steal.place).map( u => u.id).includes(c.id) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                G.state.choices.steal.unit = c
                                c.place = G.player.faction.name
                                G.state.choices.steal.unit = null
                                G.state.choices.steal.place = null
                                endPhase()
                            }
                        }
                    },
                },
            }
        },
        // book : {
        //     start : 'book',
        //     stages : {
        //         book : {
        //             options : f => G.player.faction.books,
        //             moves : {
        //                 choose : (np, c) => {
        //                     if (np == 'book' && G.player.faction.books.includes(c) ) {
        //                         G.state.choices.book.book = c
        //                         G.player.books = [...G.player.books, c ]
        //                         G.player.faction.bookreqs = G.player.faction.bookreqs.filter( b => !b['waiting...'])
        //                         G.player.faction.books = G.player.faction.books.filter( b => b != G.state.choices.book.book)
        //                         G.player.faction.bookinit[c]()
        //                         returnStage()
        //                     }
        //                 }
        //             },
        //         },
        //     }
        // },
        book : {
            start : 'book',
            stages : {
                book : {
                    options : f => G.player.faction.books,
                    moves : {
                        choose : (np, c) => {
                            if (np == 'book' && G.player.faction.books.includes(c) ) {
                                G.state.choices.book.book = c
                                G.player.books = [...G.player.books, c ]
                                G.player.faction.bookreqs = G.player.faction.bookreqs.filter( b => b != 'waiting...')
                                G.player.faction.books = G.player.faction.books.filter( b => b != G.state.choices.book.book)
                                H[c]()
                                returnStage()
                            }
                        }
                    },
                },
            }
        },
    }
}
export default phases