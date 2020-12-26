<script lang="javascript">
    export let actions = []
    let phase = 'action', stage = '', choose = x => {}
    $: actions = (stage == '') ? phases[phase].options() : phases[phase].stages[stage].options()
    $: choose = (stage == '') ? phases[phase].moves.choose : phases[phase].stages[stage].moves.choose
    let setStage = s => {stage = s;}
    let setPhase = p => {console.log(p);phase = p; stage = phases[phase].start;}
    // let endStage = s => stage = s 
    // let endPhase = s => stage = s 
    
    let phases = {
        action : {
            start : '',
            options : f => ['move','fight','hire','open','summon','steal'],
            moves : {
                choose : (np,c) => setPhase(c)
                // move :  x => {setPhase('move')},
                // fight : x => {setPhase('fight')},
                // hire :  x => {setPhase('hire')},
                // open :  x => {setPhase('open')},
                // summon :x => {setPhase('summon')},
                // steal : x => {setPhase('steal')},
                // beep :  x => {setPhase('beep')} 
            }
        },
        move : {
            start : 'unit',
            stages: {               
                    unit : {
                        next : 'place',
                        options : f => player.units.filter( u => places[u.place] ),
                        moves : {
                            choose : (np, c) => {
                                if (np == 'unit' && places[c.place] /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                    choices.move.unit = choice
                                    endStage()
                                }
                            },
                            done : f => {
                                endPhase()
                            }
                        },
                    },
                    place : {
                        next : 'unit',
                        options : f => places[choices.move.unit.place].adjacent,
                        moves : {
                            choose : (np, c) => {
                                if (np == 'place' && places[choices.move.unit.place].adjacent.includes(c)) {
                                    choices.move.place = c
                                    choices.move.unit.gate = 0
                                    choices.move.unit.place = c;
                                    player.power--
                                    choices.move.unit = null
                                    choices.move.place = null
                                    units = units
                                    if (player.power == 0) endPhase()
                                    else endStage()
                                }
                            }
                        },
                    },
                }
        },
        fight : {
            start : 'place',
            stages : {
                place : {
                    next : 'enemy',
                    options : f => places.filter( p => player.units.filter( u => u.place == p && u.fight != 0 ).length ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && places.filter( p => player.units.filter( u => u.place == p && u.fight != 0 ).length ).includes(c) ) {
                                choices.fight.place = c
                                endStage()
                            }
                        }
                    },
                },
                enemy : {
                    next : 'assignpkills',
                    options : f => players.filter( p => p.faction.name != player.faction.name && p.units.filter( u => u.place == choices.fight.place).length ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'enemy' && players.filter( p => p.faction.name != player.faction.name && p.units.filter( u => u.place == choices.fight.place).length ) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                choices.fight.enemy = c
                                calcDamage(player)
                                calcDamage(choices.fight.enemy)
                                player.power--
                                endPhase()
                            }
                        }
                    },
                }, 
                assignpkills : {
                    next : 'assignpretreats',
                    options : f => player.units.filter( u => u.place == choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( player.units.filter( u => u.place == choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                c.place = ''
                                player.kills--
                                units = units
                            }
                            if ( !player.kills || !player.units.filter( u => u.place == choices.fight.place ).length ) 
                                endStage()
                        }
                    }
                },
                assignpretreats : {
                    next : 'placepretreats',
                    options : f => player.units.filter( u => u.place == choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( player.units.filter( u => u.place == choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                choice.fight.unit = c
                                endStage()
                            }
                        }
                    }
                },
                placepretreats : {
                    next : 'assignekills',
                    options : f => places[choices.fight.unit.place].adjacent.filter( p => !choices.fight.enemy.units.map( u => u.place ).includes(p)),
                    moves : {
                        choose : (np, c) => {
                            if ( places[choices.fight.unit.place].adjacent.filter( p => !choices.fight.enemy.units.map( u => u.place ).includes(p)).includes( c ) ) {
                                choices.fight.unit.place = c
                                player.pains--
                                units = units
                            }
                            if ( !player.pains || !player.units.filter( u => u.place == choices.fight.place ).length ) 
                                endStage()
                            else
                                setStage('assignpretreats')
                        }
                    }
                },
                assignekills : {
                    next : 'assigneretreats',
                    options : f => choices.fight.enemy.units.filter( u => u.place == choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( choices.fight.enemy.units.filter( u => u.place == choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                c.place = ''
                                choices.fight.enemy.kills--
                                units = units
                            }
                            if ( !choices.fight.enemy.kills || !choices.fight.enemy.units.filter( u => u.place == choices.fight.place ).length ) 
                                endStage()
                        }
                    }
                },
                assigneretreats : {
                    next : 'placeeretreats',
                    options : f => choices.fight.enemy.units.filter( u => u.place == choices.fight.place ),
                    moves : {
                        choose : (np, c) => {
                            if ( choices.fight.enemy.units.filter( u => u.place == choices.fight.place ).map( u => u.id ).includes( c.id ) ) {
                                choice.fight.unit = c
                                endStage()
                            }
                        }
                    }
                },
                placeeretreats : {
                    options : f => places[choices.fight.unit.place].adjacent.filter( p => !player.units.map( u => u.place ).includes(p)),
                    moves : {
                        choose : (np, c) => {
                            if ( places[choices.fight.unit.place].adjacent.filter( p => !player.units.map( u => u.place ).includes(p)).includes( c ) ) {
                                choices.fight.unit.place = c
                                choices.fight.enemy.pains--
                                units = units
                            }
                            if ( !choices.fight.enemy.pains || !choices.fight.enemy.units.filter( u => u.place == choices.fight.place ).length ) {
                                endPhase()
                                choices.fight.place = null
                                choices.fight.enemy = null
                                choices.fight.unit = null
                            } else
                                setStage('assignpretreats')
                        }
                    }
                }
            }
        },
        hire : {
            start : 'place',
            stages : {
                place : {
                    options : f => places.filter( p => player.units.map( u => u.places ).includes(p) ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && player.units.map( u => u.places ).includes(c) ) {
                                choices.hire.place = c
                                let u = player.units.find( u => u.place == '' && u.type == 'cult')
                                if (!u) setPhase('action')
                                u.place = c
                                player.power--
                                choices.hire.place = null
                                endPhase()
                            }
                        }
                    }
                },
            }
        },
        open : {
            start : 'place',
            stages : {
                place : {
                    options : f => places.filter( p => player.units.filter( u => u.type == 'cult' ).map( u => u.places ).includes(p) ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && player.units.filter( u => u.type == 'cult' ).map( u => u.places ).includes(c) ) {
                                choices.open.place = c
                                places[choices.open.place].gate = 1
                                player.power-=3
                                endPhase()
                            }
                        }
                    }
                },
            }
        },
        summon : {
            start : 'unit',
            stages : {
                unit : {
                    next : 'place',
                    options : f => player.units.filter( u => !places[u.place] && u.cost <= player.power),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'unit' && !places[c.place] && c.cost <= player.power /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                choices.summon.unit = c
                                endStage()
                            }
                        },
                        done : f => {
                            endPhase()
                        }
                    },
                },
                place : {
                    options : f => player.units.filter( u => u.gate ).map( u => u.place ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && player.units.filter( u => u.gate ).map( u => u.place ).includes(c)) {
                                choices.summon.place = c
                                choices.summon.unit.place = c
                                player.power -= choices.summon.unit.cost
                                choices.summon.unit = null
                                choices.summon.place = null
                                units = units
                                endStage()
                            }
                        }
                    },
                },
            }
        },
        steal : {
            start : 'place',
            stages : {
                place : {
                    next : 'unit',
                    options : f => places.filter( p => stealableUnitsIn(p).length ),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'place' && stealableUnitsIn(c).length ) {
                                choices.steal.place = c
                                endStage()
                            }
                        }
                    },
                },
                unit : {
                    options : f => stealableUnitsIn(choices.steal.place),
                    moves : {
                        choose : (np, c) => {
                            if (np == 'unit' && stealableUnitsIn(choices.steal.place).map( u => u.id).includes(c.id) /*&& !(places[c.place].tokens.includes('iceage') && player.power < 2)*/) {
                                choices.summon.unit = c
                                c.place = player.faction.name
                                choices.steal.unit = null
                                choices.steal.place = null
                                endPhase()
                            }
                        }
                    },
                },
            }
        },
    }

    let stealableUnitsIn = (p) => {
            let tmpunits = []
            players.map ( pl => {
                tmpunits = [...units, ...pl.units.filter( u => u.place == p )]
            })
            dom = []
            tmpunits.map( u => 
                dom[u.owner.faction.name] = (dom[u.owner.faction.name] < u.tier) 
                    ? u.tier : dom[u.owner.faction.name]
            )
            tmpunits.filter( u => 
                u.tier = 0 && dom[u.owner.faction.name] < dom[player.faction.name] 
            )
            return tmpunits
    }
    let calcDamage = (p) => {
        let r = roll( p.units.filter( u => u.place == choices.fight.place ).map( u => typeof u.combat == 'function' ? u.combat() : u.combat ) )
        p.kills = r.filter( e => e > 4 ).length
        p.pains = r.filter( e => e < 5 && e > 2).length
    }



</script>

<style lang="stylus">
      
</style>

<!-- prettier-ignore -->
<template lang="pug">
    ul 
       +each('actions as action')
            li(on:click='{(function c(){choose(stage,action)})}') {action}
</template>
