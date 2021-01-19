<script lang="javascript">
    import Map from './Map.svelte'
    import Player from './Player.svelte'
    import places from './places.js'
    import factions from './factions.js'
    import phases from './phases.js'
    import Unit from './Unit.svelte'
    import faction from './bg'
    let helpers = {
        findPlyr : (name) => G.players.find( p => p.faction.name == name),
        forceRerender : () => { console.log(G); G = G },
        initGame : () => {
            phases.init(G)
            factions(G,phases)
            G.players = Object.values(G.factions)
            .map( f => ({ units:[],faction:f,doom:0,power:8,books:[],temp:{} }))
            .map( p => {
                p.units = Array(6).fill(null).map( u => unit('cult',p.faction.name,p.faction.start) )
                p.units[2].gate=p.faction.start
                places[p.faction.start].gate=1
                p.faction.initUnits(p)
                return p
            })
            G.turn = {lim:1,pi:G.players.indexOf(findPlyr('gc'))||0}
            G.phase = 'action'
            G.stage = 'start'
        },
        log:f=>JSON.stringify(G.phases),
        push:f=>{firebase.database().ref('game/' + 1).set(JSON.stringify(G))},
        pull:f=>{firebase.database().ref('game/' + 1).once('value').then(g=>G={...JSON.parse(g.val()),phases:G.phases})},
        genId : () => {},
        unit : ( type = '', owner = {}, place = '', cost = 0, fight = 0, tier = 0, gather = 0) => ({ id:genid(), type, owner, place, cost, fight, gather, tier, gate:0 })
    }
    window.H = helpers
    let findPlyr = (name) => G.players.find( p => p.faction.name == name)
    let forceRerender = f => {
        console.log(G)
        G = G
    }
    let players, turn, phase, stage, choices, units, player
    let unit = ( type = '', owner = {}, place = '', cost = 0, fight = 0, tier = 0, gather = 0) => ({ id:genid(), type, owner, place, cost, fight, gather, tier, gate:0 })
    let G = {unit, choices, players, player, places, phases, turn, phase, stage, units, forceRerender}
    phases.init(G,helpers)
    factions(G,phases,helpers)
    let genid = f => nonce++
    let nonce = 0
    G.players = Object.values(G.factions).map( f => ({ units:[],faction:f,doom:0,power:0,books:[],temp:{} }))
    G.players.map( p => {
        p.units = Array(6).fill(null).map( u => unit('cult',p.faction.name,p.faction.start) )
        p.units[2].gate=p.faction.start
        places[p.faction.start].gate=1
        p.power = 8
        p.faction.initUnits(p)
    })
    G.turn = {lim:1,pi:G.players.indexOf(G.players.find( p => p.faction.name == 'gc'))||0}
    G.phase = 'action'
    G.stage = 'start'
    let actions = []
    G.ritualtracks = {
        3:[5,6,7,8,9,10],
        4:[5,6,7,7,8,8,9,10],
        5:[5,6,6,7,7,8,8,9,9,10],
    }
    G.rituals = 0
    let choose = x => {}
    let noop = (np,c) => {}
    let click = action => f => G.choose(G.stage,action)

    $: G.player = G.players[G.turn.pi%G.players.length]
    $: G.units = G.players.reduce((acc,cur)=>[...acc,...cur.units],[])
    $: G.ritualcost = G.ritualtracks[G.players.length][G.rituals]
    $: actions = (G.stage == '') ? G.phases[G.phase]?.options()||[] : G.phases[G.phase].stages[G.stage]?.options()||[]
    $: G.choose = ((G.stage == '') ? G.phases[G.phase]?.moves?.choose||noop : G.phases[G.phase].stages[G.stage]?.moves?.choose)||noop
    
    let firebaseConfig = {
        apiKey: "AIzaSyAtutNxHpxtCJi3EUB3irfhNiTfoMu1zLY",
        authDomain: "cw-wars.firebaseapp.com",
        databaseURL: "https://cw-wars-default-rtdb.firebaseio.com",
        projectId: "cw-wars",
        storageBucket: "cw-wars.appspot.com",
        messagingSenderId: "311965598360",
        appId: "1:311965598360:web:b4f0ff76188930035e86ed"
    }
    firebase.initializeApp(firebaseConfig);
</script>
<style lang="stylus">
    .hud
        position absolute
        top 0
        right 0
        width 15%
        height 100%
        z-index 10
        display flex
        flex-direction column
        ul
            list-style-type none
            li
                width 90%
                border-bottom 0.1em solid
                margin 0.2em
                font-size 2em
                
    .actions
        height 80%
        font-family 'Montserrat',arial
        margin 0.5%
        padding 0.3em
        text-align center
        border 0.1em solid black
        box-sizing border-box
        box-shadow 1px 1px 4px 1px #000a
        overflow hidden
        top 0
        width 100%
        color #ababab
        background #323232
        transition height 0.5s
        overflow-y scroll

        
</style>

<!-- prettier-ignore -->

<template lang="pug">
    .tooltip(class='hidden' style='position:absolute;background:black;width:10em;z-index:100') wubwub
    Map('{...G}')
    .hud
        +each('G.players as player (player.faction.name)')
            Player(choose='{G.choose}' '{player}' '{G}')
        .actions(style='color: {G.player.faction.color}') actions
            ul(style='padding:0')
                +each('actions as action')
                    +if('G.stage.includes("unit")')
                        li(on:click='{click(action)}' style='color:{findPlyr(action.owner).faction.color}') {action.type} in {action.place||"pool"}
                        +elseif('G.stage.includes("player") || G.stage.includes("enemy") || G.stage.includes("faction")')
                            li(on:click='{click(action)}' style='color:{action.faction.color}') {action.faction.name}
                            +else
                                li(on:click='{click(action)}') {action}
                +if('G.phases[G.phase].stages && G.phases[G.phase].stages[G.stage].moves.done')
                    li(on:click='{G.phases[G.phase].stages[G.stage].moves.done}') done
                    +elseif('G.phases[G.phase].moves && G.phases[G.phase].moves.done')
                        li(on:click='{G.phases[G.phase].moves.done}') done
    </template>
