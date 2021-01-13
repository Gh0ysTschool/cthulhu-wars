let G, lim = 1, unlim = 1

let stealableUnitsIn = (p) => {
    let tmpunits = []
        tmpunits = G.units.filter( u => u.place == p )
        let dom = {}
        G.players.map( p => dom[p.faction.name] = 0)
        tmpunits.map( u => 
            dom[u.owner.faction.name] = (dom[u.owner.faction.name] < u.tier) 
            ? u.tier : dom[u.owner.faction.name]
        )
        tmpunits = tmpunits.filter( u => 
            u.tier == 0 && dom[u.owner.faction.name] < dom[G.player.faction.name] 
        )
        return tmpunits
}
let calcDamage = (p) => {
    let r = roll( p.units.filter( u => u.place == choices.fight.place ).map( u => typeof u.combat == 'function' ? u.combat() : u.combat ) )
    p.temp.phase.kills = r.filter( e => e > 4 ).length
    p.temp.phase.pains = r.filter( e => e < 5 && e > 2).length
}
let roll = ( dice ) => Math.floor((Math.random() * 6) + 1)
let endTurn = t => { 
    G.player.temp.turn = {}
    if (!G.players.filter( p => p.power ).length) 
        phases.setPhase('gather')
    G.turn.lim=1; 
    G.turn.pi++;
    while(G.phase == 'action' && !G.players[G.turn.pi%G.players.length].power) 
        G.turn.pi++
    G.forceRerender();
}
let returnStage = f => {}
let interuptStage = (inphase,instage,inpi) => {
    let rphase = ''+G.phase
    let rstage = ''+G.stage
    let rpi = 0+G.turn.pi
    returnStage = phases.returnStage = f => {
        G.phase = rphase
        G.stage = rstage
        G.turn.pi = rpi
        G.forceRerender()
        if (G.phase == 'action' && !G.phases.action.stages.start.options().length) endTurn()
        else if (G.stage && !G.phases[G.phase].stages[G.stage].options().length) endStage()
        else if (G.phases[G.phase].options && !G.phases[G.phase].options().length) endStage()
    }
    G.phase = inphase
    G.stage = instage
    G.turn.pi = inpi
    G.forceRerender()
}
let checkbooks = () => 
    G.players.map( p => p.faction.bookreqs.map( (l,i) => {
        if (Object.values(l)[0]()){
            p.faction.bookreqs[i] = {'waiting...':f=>false}
            interuptStage('book','book',G.players.indexOf(p))
        }
    }))
let lostGates = g => Object.keys(G.places).filter( p => G.places[p].gate && !G.units.filter( u => u.place == p && u.gate).length )
let autoMountGates = g => {
    lostGates().map( pl => {
        let stop = 0
        G.players.map( p => {
            let cults = p.units.filter( u => u.type == 'cult' && u.place == pl )
            if (cults.length && !stop) {
                cults[0].gate = pl
                stop = 1
            }
        })
        G.places[pl].nocults = !stop
    })
}
let phaseInit = () => {
    if (G.stage && G.phases[G.phase].stages[G.stage].init)
        G.phases[G.phase].stages[G.stage].init() 
    else if (G.stage == '' && G.phases[G.phase].init)
        G.phases[G.phase].init() 
}
let setStage = s => {G.stage = s; phaseInit(); G.forceRerender();}
let endStage = s => {autoMountGates(); if (G.phases[G.phase].stages[G.stage].next) {setStage(G.phases[G.phase].stages[G.stage].next)} else {endPhase();}}
let setPhase = p => {
    G.phase = p
    G.stage = G.phases[G.phase].start||''
    autoMountGates()
    checkbooks()
    phaseInit()
    G.forceRerender()
}
let endPhase = p => {
    G.players.map( p => p.temp.phase = {} )
    if (G.phases[G.phase].lim) 
        G.turn.lim--
    G.phase = (G.phases[G.phase].next) ? G.phases[G.phase].next : 'action';
    G.stage = G.phases[G.phase].start||''
    autoMountGates()
    checkbooks()
    phaseInit()
    G.forceRerender();
    if (G.phase == 'action' && !G.phases.action.stages.start.options().length) endTurn()
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
    init : g => {G = g; G.phases = phases.phases;},

    phases : {
        gather : {
            start : 'start',
            stages : {
                start : {
                    init : f => {
                        Object.keys(G.choices).map( k => {
                            if (G.choices[k].once !== undefined)
                                G.choices[k].once = 1
                        })
                        G.players.map( 
                            p => p.power += lostGates().length 
                            + p.units.filter(
                                u => (u.type == 'cult' || u.gatherer) 
                                && Object.keys(G.places).includes(u.place)
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
                        G.players.map( p => highest = (p.power > highest.power) ? p : highest)
                        G.turn.pi = G.players.indexOf(highest)
                        G.players.map( p => p.power = (p.power < highest.power/2) ? highest.power/2 : p.power);
                    },
                    options : f => ['keep turn order','reverse turn order'],
                    moves : {
                        choose : (np,c) => {
                            let p = G.players[G.turn.pi]
                            if( ['keep turn order','reverse turn order'].includes(c) ) {
                                if (c == 'reverse turn order') {
                                    G.players = G.players.reverse()
                                    G.turn.pi = G.players.indexOf(p)
                                }
                                G.players.map( p => p.ritual = 1)
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
                            G.turn.pi++        
                            if (!G.players.filter( p => p.ritual).length) endStage()
                            G.forceRerender()
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
                    options : f => Object.keys(G.phases).filter( p => (G.phases[p].unlim || (G.phases[p].lim && G.turn.lim)) && (!G.phases[p].req || G.phases[p].req())),
                    moves : {
                        choose : (np,c) => {if (np == 'start') setPhase(c)},
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
                        options : f => G.player.units.filter( u => G.places[u.place] && !u.moved),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'unit' && G.player.units.filter( u => G.places[u.place] ).map( u => u.id ).includes(c.id) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                    G.choices.move.unit = c
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
                        options : f => (G.choices.move.unit.speed == 2 ) ? Array.from( new Set(G.places[G.choices.move.unit.place].adjacent.reduce( (acc,p) => acc.concat(G.places[p].adjacent), []) ) ) : G.places[G.choices.move.unit.place].adjacent,
                        moves : {
                            choose : (np, c) => {
                                if (np == 'place' && G.places[G.choices.move.unit.place].adjacent.includes(c)) {
                                    G.choices.move.place = c
                                    G.choices.move.unit.gate = 0
                                    G.choices.move.unit.place = c
                                    G.choices.move.unit.moved = 1
                                    G.player.power--
                                    G.choices.move.unit = null
                                    G.choices.move.place = null
                                    G.forceRerender()
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
            req : f=>Object.keys(G.places).find( p => G.player.units.find( u => u.fight != 0 && u.place == p) && G.units.find( u => u.place == p && u.owner.faction.name != G.player.faction.name ) ),
            init : f => G.choices.fight.player = G.players[G.turn.pi],
            stages : {
                place : {
                    next : 'enemy',
                    options : f => Object.keys(G.places).filter( p => G.player.units.filter( u => u.place == p && u.fight != 0 ).length ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && Object.keys(G.places).filter( p => G.player.units.find( u => u.fight != 0 && u.place == p) && G.units.find( u => u.place == p && u.owner.faction.name != G.player.faction.name ) ).includes(c) ) {
                                G.choices.fight.place = c
                                endStage()
                            }
                        }
                    },
                },
                enemy : {
                    next : 'roll',
                    options : f => G.players.filter( p => p.faction.name != G.player.faction.name && p.units.filter( u => u.place == G.choices.fight.place).length ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'enemy' && G.players.filter( p => p.faction.name != G.player.faction.name && p.units.filter( u => u.place == G.choices.fight.place).length ) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                G.choices.fight.enemy = c
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
                        calcDamage(G.choices.fight.enemy)
                        endPhase()
                    },
                    options : f => [],
                    moves : {
                        choose : (np,c) => {}
                    }
                },
                assignpkills : {
                    next : 'assignpretreats',
                    options : f => G.player.units.filter( u => u.place == G.choices.fight.place && (!u?.invulnerable ) ),
                    moves : {
                        choose : (np, c) => {
                            if ( G.player.units.filter( u => u.place == G.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                c.place = ''
                                c.gate = 0
                                G.player.temp.phase.kills--
                                G.forceRerender()
                            }
                            if ( !G.player.temp.phase.kills || !G.player.units.filter( u => u.place == G.choices.fight.place ).length ) 
                                endStage()
                        }
                    }
                },
                assignpretreats : {
                    next : 'placepretreats',
                    options : f => G.player.units.filter( u => u.place == G.choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( G.player.units.filter( u => u.place == G.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                G.choice.fight.unit = c
                                endStage()
                            }
                        }
                    }
                },
                placepretreats : {
                    next : 'assignekills',
                    options : f => G.places[G.choices.fight.unit.place].adjacent.filter( p => !G.choices.fight.enemy.units.map( u => u.place ).includes(p)),
                    moves : {
                        choose : (np, c) => {
                            if ( G.places[G.choices.fight.unit.place].adjacent.filter( p => !G.choices.fight.enemy.units.map( u => u.place ).includes(p)).includes( c ) ) {
                                G.choices.fight.unit.place = c
                                G.player.temp.phase.pains--
                                G.forceRerender()
                            }
                            if ( !G.player.temp.phase.pains || !G.player.units.filter( u => u.place == G.choices.fight.place ).length ) 
                                endStage()
                            else
                                setStage('assignpretreats')
                        }
                    }
                },
                assignekills : {
                    next : 'assigneretreats',
                    options : f => G.choices.fight.enemy.units.filter( u => u.place == G.choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( G.choices.fight.enemy.units.filter( u => u.place == G.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                c.place = ''
                                c.gate = 0
                                G.choices.fight.enemy.temp.phase.kills--
                                G.forceRerender()
                            }
                            if ( !G.choices.fight.enemy.kills || !G.choices.fight.enemy.units.filter( u => u.place == G.choices.fight.place ).length ) 
                                endStage()
                        }
                    }
                },
                assigneretreats : {
                    next : 'placeeretreats',
                    options : f => G.choices.fight.enemy.units.filter( u => u.place == G.choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( G.choices.fight.enemy.units.filter( u => u.place == G.choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                G.choice.fight.unit = c
                                endStage()
                            }
                        }
                    }
                },
                placeeretreats : {
                    options : f => G.places[choices.fight.unit.place].adjacent.filter( p => !G.player.units.map( u => u.place ).includes(p)),
                    moves : {
                        choose : (np, c) => {
                            if ( G.places[choices.fight.unit.place].adjacent.filter( p => !player.units.map( u => u.place ).includes(p)).includes( c ) ) {
                                G.choices.fight.unit.place = c
                                G.choices.fight.enemy.temp.phase.pains--
                                G.forceRerender()
                            }
                            if ( !G.choices.fight.enemy.pains || !G.choices.fight.enemy.units.filter( u => u.place == G.choices.fight.place ).length ) {
                                endStage()
                                G.choices.fight.place = null
                                G.choices.fight.enemy = null
                                G.choices.fight.unit = null
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
                                G.choices.hire.place = c
                                let u = G.player.units.find( u => u.place == '' && u.type == 'cult')
                                if (!u) setPhase('action')
                                u.place = c
                                G.player.power--
                                G.choices.hire.place = null
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
            req : f => G.player.power > 2 && G.player.units.filter( u => u.type == 'cult' && !G.player.units.filter( u => u.gate ).map( u => u.place ).includes(u.place)),
            stages : {
                place : {
                    options : f => Object.keys(G.places).filter( p => !G.places[p].gate && G.player.units.filter( u => u.type == 'cult' ).map( u => u.place ).includes(p) ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && G.player.units.filter( u => u.type == 'cult' ).map( u => u.place ).includes(c) ) {
                                G.choices.open.place = c
                                G.places[G.choices.open.place].gate = 1
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
                    options : f => G.player.units.filter( u => !G.places[u.place] && u.tier==1 && ((typeof u.cost == 'function') ? u.cost() : u.cost) <= G.player.power),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'unit' && !G.places[c.place] && c.cost <= G.player.power /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                G.choices.summon.unit = c
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
                                G.choices.summon.place = c
                                G.choices.summon.unit.place = c
                                G.player.power -= G.choices.summon.unit.cost
                                G.choices.summon.unit = null
                                G.choices.summon.place = null
                                G.forceRerender()
                                endStage()
                            }
                        }
                    },
                },
            }
        },
        awaken : {
            lim,
            start : 'unit',
            req : f => G.player.units.filter( u => u.tier == 2 && u.place == '' && u.awakenreq()).length,
            stages : {
                unit : {
                    next : 'place',
                    options : f => G.player.units.filter( u => u.tier==2 && u.awakenreq()),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'unit' && G.player.units.filter( u => u.tier==2 && u.awakenreq()).includes(c)) {
                                G.choices.awaken.unit = c
                                endStage()
                            }
                        },
                        done : f => {
                            endPhase()
                        }
                    },
                },
                place : {
                    options : f => G.choices.awaken.unit.awakenplaces(),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && G.choices.awaken.unit.awakenplaces().includes(c)) {
                                G.choices.awaken.place = c
                                G.choices.awaken.unit.place = c
                                // G.player.power -= G.choices.awaken.unit.cost
                                // G.choices.awaken.unit = null
                                // G.choices.awaken.place = null
                                G.choices.awaken.unit.cost()
                                G.forceRerender()
                                // endStage()
                            }
                        }
                    },
                },
            }
        },
        steal : {
            lim,
            start : 'place',
            req : f => Object.keys(G.places).filter( p =>stealableUnitsIn(p).length ).length,
            stages : {
                place : {
                    next : 'unit',
                    options : f => Object.keys(G.places).filter( p =>stealableUnitsIn(p).length ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && stealableUnitsIn(c).length ) {
                                G.choices.steal.place = c
                                G.choices.steal.gate = 0
                                endStage()
                            }
                        }
                    },
                },
                unit : {
                    options : f => stealableUnitsIn(G.choices.steal.place),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'unit' && stealableUnitsIn(G.choices.steal.place).map( u => u.id).includes(c.id) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                G.choices.steal.unit = c
                                c.place = G.player.faction.name
                                G.choices.steal.unit = null
                                G.choices.steal.place = null
                                endPhase()
                            }
                        }
                    },
                },
            }
        },
        book : {
            start : 'book',
            stages : {
                book : {
                    options : f => G.player.faction.books,
                    moves : {
                        choose : (np, c) => {
                            if (np == 'book' && G.player.faction.books.includes(c) ) {
                                G.choices.book.book = c
                                G.player.books = [...G.player.books, c ]
                                G.player.faction.bookreqs = G.player.faction.bookreqs.filter( b => !b['waiting...'])
                                G.player.faction.books = G.player.faction.books.filter( b => b != G.choices.book.book)
                                G.player.faction.bookinit[c]()
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