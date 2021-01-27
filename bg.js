let G, phs, H
let faction = (g,p,h) => {
    G = g
    phs = p
    H = h
    let books = ["Blood Sacrifice","Frenzy","Ghroth","Necrophagy","The Red Sign","The Thousand Young"]
    let bookinit = ["Blood Sacrifice","Frenzy","Ghroth","Necrophagy","The Red Sign","The Thousand Young"]
    // {
    //     "Blood Sacrifice":blood,
    //     "Frenzy":frenzy,
    //     "Ghroth":ghroth,
    //     "Necrophagy":necrophagy,
    //     "The Red Sign":redsign,
    //     "The Thousand Young":thousand
    // }
    H["Blood Sacrifice"]=blood
    H["Frenzy"]=frenzy
    H["Ghroth"]=ghroth
    H["Necrophagy"]=necrophagy
    H["The Red Sign"]=redsign
    H["The Thousand Young"]=thousand
    let bookreqs = [
        'sac 2 cults',
        'be in 4 areas',
        'be in 6 areas',
        'be in 8 areas',
        "Awaken Shub Nigur'rath",
        'be in all enemy areas'
        // {'sac 2 cults':f=>false },
        // {'be in 4 areas':f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 3 },
        // {'be in 6 areas':f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 5 },
        // {'be in 8 areas':f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 7 },
        // {"Awaken Shub Nigur'rath":f=> G.state.choices.awaken.unit?.type=="Shub Nigur'rath"},
        // {'be in all enemy areas':f=> G.state.players.filter( pl => pl.units.filter( un => Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).includes(un.place) ).length).length == G.state.players.length  }
    ]
    H['sac 2 cults']=f=>false
    H['be in 4 areas']=f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 3 
    H['be in 6 areas']=f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 5 
    H['be in 8 areas']=f=> Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).length > 7 
    H["Awaken Shub Nigur'rath"]=f=> G.state.choices.awaken.unit?.type=="Shub Nigur'rath"
    H['be in all enemy areas']=f=> G.state.players.filter( pl => pl.units.filter( un => Object.keys(G.state.places).filter( p => G.state.players.find( pl => pl.faction.name == 'bg' ).units.map( u => u.place ).includes(p) ).includes(un.place) ).length).length == G.state.players.length

    let color = 'red'
    let start = 'westafrica'
    let name = 'bg'
    let units = []
    let awakenshub = {
        awakenplaces: () => G.player.units.filter( u => u.gate ).map( u => u.place ),
        awakenreq: ()=>G.player.power > 7 && G.player.units.filter( u => u.place != '' && u.type == 'cult').length > 1 && G.player.units.filter( u => u.gate ).length,
        cost: ()=>{ G.player.power-=8; G.player.sac = 2; phs.setStage('bg-sacunit');},
    }
    H["Shub Nigur'rath"]=awakenshub
    let initUnits = p => {
        p.units = [
            ...p.units,
            {...H.unit("Shub Nigur'rath",name,'',8,()=>p.units.filter( u => u.type == 'cult').length,2),...awakenshub},
            ...[0,1,].map( f=> H.unit('Ghoul',name,'',1,0,1)),
            ...[0,1,2,3].map( f=> H.unit('Fungi',name,'',2,1,1)),
            ...[0,1,2].map( f=> H.unit('Dark Young',name,'',3,2,1,1)),
        ]
    }
    
    fertility()
    bgsac()
    sac2cult()
    avatar()
    return {books,bookreqs,bookinit,color,start,name,units,initUnits}
}
export default faction

let lim = 1, unlim = 1, req = f => true, init = f => {}
let sac2cult = () => phs.addPhase('sac 2 cultists',{
    lim,
    req : f => G.player.faction.name=='bg' && G.player.faction.bookreqs.includes('sac 2 cults'),
    start : 'unit',
    stages: {               
        unit : {
            init : f => G.player.sacs = 2,
            options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
            moves : {
                choose : (np, c) => {
                    if ( ( np == 'unit' || np == 'sac 2 cultists' ) && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).includes(c)) {
                        G.player.sacs--
                        c.place = ''
                        c.gate = 0
                        if (G.player.sacs == 0) {
                            H['sac 2 cults'] = f => true
                            phs.endPhase()
                        }
                        else H.forceRerender()
                    }
                }
            }
        }
    }
})
let bgsac = () => phs.addStage('bg-sacunit',{
    init : f => G.player.sacs = 2,
    options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
    moves : {
        choose : (np, c) => {
            if ( (np == 'unit' || np == 'bg-sacunit') && G.player.units.filter( u => u.type == 'cult' ).includes(c) ) {
                G.player.sacs--
                c.place = ''
                c.gate = 0
                H.forceRerender()
                if (G.player.sacs == 0) phs.endStage()
            }
        }
    }
},'awaken')

let avatar = () => {
    G.state.choices.avatar = {place:null,faction:null,unit:null}
    phs.addPhase('avatar',{
        lim,
        init,
        req : f => G.player.faction.name=='bg' && G.player.units.find( u => u.type == "Shub Nigur'rath" && u.place != '' ) && G.player.power >= 1,
        start : 'place',
        stages: {               
            place : {
                next : 'faction',
                options : f => Object.keys(G.state.places).filter( p => G.units.map( u => u.place ).includes(p) ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'place' && G.units.map( u => u.place ).includes(c)) {
                            G.state.choices.avatar.place = c
                            phs.endStage()
                        }
                    }
                }
            },
            faction : {
                next : 'unit',
                options : f => G.state.players.filter( p => p.units.map( u => u.place).includes( G.state.choices.avatar.place ) ).map( p => p.faction.name ),
                moves : {
                    choose : (np, c) => {
                        if  ( np == 'faction' && G.state.players.filter( p => p.units.map( u => u.place).includes( G.state.choices.avatar.place ) ).map( p => p.faction.name ).includes(c) ){
                            G.state.choices.avatar.faction = G.state.players.find( p => p.faction.name == c)
                            G.state.stage = 'resolve'
                            phs.interuptStage('avatar','unit',G.state.players.indexOf(G.state.choices.avatar.faction))
                        }
                        else if ( np == 'player' && G.state.players.filter( p => p.units.map( u => u.place).includes( G.state.choices.avatar.place ) ).includes(c) ) {
                            G.state.choices.avatar.faction = c
                            G.state.stage = 'resolve'
                            phs.interuptStage('avatar','unit',G.state.players.indexOf(G.state.choices.avatar.faction))
                        }
                    }
                }
            },
            unit : {
                next : 'resolve',
                options : f => G.state.choices.avatar.faction.units.filter( u => u.place == G.state.choices.avatar.place ),
                moves : {
                    choose : (np, c) => {
                        if  ( np == 'unit' && G.state.choices.avatar.faction.units.filter( u => u.place == G.state.choices.avatar.place ).includes(c) ){
                            G.state.choices.avatar.unit = c
                            phs.endStage()
                        }
                    }
                }
            },
            resolve : {
                init : f => {
                    G.state.choices.avatar.unit.place = G.state.choices.avatar.place
                    G.state.turn.pi = G.state.players.indexOf(G.state.players.find(p => p.faction.name == 'bg'))
                    G.state.players[G.state.turn.pi].power--
                    G.state.players[G.state.turn.pi].units.find( u => u.name == "Shub Nigur'rath").place = G.state.choices.avatar.place
                    phs.endStage()
                },
                moves : {},
                options : f => [],
            }

        }
    })
}

let necrophagy = () => {
    G.state.choices.necro = { once : null }
    phs.addStage('necrounits',{
        options : f => G.player.units.filter( u => u.type == 'Ghoul' && u.place != '' && !u.moved),
        init : f => {
            if ( G.state.choices.necro.once) {G.state.choices.necro.once = null; phs.endStage()}
            else {
                G.state.stage = 'assignpretreats'
                phs.interuptStage('fight','necrounits',G.state.players.indexOf(G.state.players.find( p => p.faction.name == 'bg' )))
            }
        },
        moves : {
            choose : (np,c) => {
                if ( c.type == 'Ghoul' && c.place != '' && !c.moved) {
                    G.state.choices.fight.enemy.pains++
                    G.state.choices.fight.player.pains++
                    c.moved = 1
                    c.place = G.state.choices.fight.place
                    H.forceRerender()
                }
            },
            done : f => {        
                G.state.choices.necro.once = 1
                G.player.units.map( u => u.moved = 0)
                phs.returnStage()
            },
        }
    },'fight','placeeretreats')
}

let ghroth = () => {
    G.state.choices.ghroth = { roll : 0, offers : [], tries : 3, negotiated : 0 }
    phs.addPhase('ghroth',{
        lim,
        init : f => {
            G.state.choices.ghroth.roll = roll(G.state.places.filter( p => G.player.units.filter( u => u.type == 'Fungi' ).map( u => u.place).includes(p) ).length )
            G.state.choices.ghroth.offers = Array(G.state.players.length).fill(0)
            G.state.turn.pi++
        },
        req : f => G.player.faction.name == 'bg' && G.player.power > 1,
        start : 'negotiate',
        stages: {               
            negotiate : {
                next : 'unit',
                options : f => Array(G.state.choices.ghroth.roll+1).fill(0).map( (l,i) => i).filter( l => l < G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).length ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'negotiate' && Array(G.state.choices.ghroth.roll+1).fill(0).map( (l,i) => i).filter( l => l <= G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).length ).includes(c) ) {
                            G.state.choices.ghroth.offers[G.state.turn.pi%G.state.players.length] = c
                            G.state.turn.pi++
                            if ( G.state.players[G.state.turn.pi].faction.name=='bg') {
                                tries--
                                G.state.choices.ghroth.negotiated = (G.state.choices.ghroth.offers.reduce((acc,cur)=>acc+cur,0) >= G.state.choices.ghroth.roll )
                            }
                            if ( G.state.choices.ghroth.tries || G.state.choices.ghroth.negotiated) G.state.turn.pi++
                            if (!G.state.choices.ghroth.tries || G.state.choices.ghroth.negotiated) setStage( (G.state.choices.ghroth.negotiated) ? 'unit' : 'altunit')
                            H.forceRerender()
                        }
                        
                    },
                }
            },             
            unit : {
                next : '',
                options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'unit' && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).includes(c)) {
                            c.place = ''
                            G.state.choices.ghroth.offers[G.state.turn.pi%G.state.players.length]--
                            if(!G.state.choices.ghroth.offers[G.state.turn.pi%G.state.players.length]) G.state.turn.pi++
                            H.forceRerender()
                            if(!G.state.choices.ghroth.offers.reduce((acc,cur)=>acc+cur,0)) phs.endStage()
                        }
                    },
                }
            },             
            altunit : {
                init : f => G.state.choices.ghroth.offers = G.state.choices.ghroth.offers.reduce((acc,cur)=>acc+cur,0),
                next : '',
                options : f => G.units.filter( u=> u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
                moves : {
                    choose : (np, c) => {
                        if ( np == 'unit' && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ).includes(c)) {
                            c.place = ''
                            G.state.choices.ghroth.offers--
                            H.forceRerender()
                            if(!G.state.choices.ghroth.offers) phs.endStage()
                        }
                    },
                }
            }
        }
    })
}

let blood = () => {
    phs.addStage('bloodinit',{
        init : f => phs.interuptStage( 'doom','blood',G.state.players.indexOf( G.state.players.find( p => p.faction.name=='bg') ) ),
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
        options : f => G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ),
        moves : { 
            choose : (np,c) => {
                if ( (np == 'unit' || np == 'bloodunit') && G.player.units.filter( u => u.type == 'cult' && Object.keys(G.state.places).includes(u.place) ) ) {
                    c.place = ''
                    G.player.signs.push((phs.roll()%3)+1)
                    phs.returnStage()
                }
            }
        }
    },'doom');
}

let fertility = () => phs.addStage('fertility',{
    init : f => {G.state.turn.lim+=G.player.faction.name=='bg';phs.endStage()},
    options : f => [],
    moves : { choose : (np,c) => {}}
},'summon','place')

let frenzy = () => G.player.units.filter( u => u.type == 'cult' ).map( u => u.combat = 1 )

let thousand = () => G.player.units.filter( u => u.tier == 1 ).map( u => {let cost = 0+u.cost; u.cost = f => cost - G.units.find( un => un.type == "Shub Nigur'rath").place != '' })

let redsign = () => G.player.units.filter( u => u.type == 'Dark Young' ).map( u => u.gatherer = 1 )

