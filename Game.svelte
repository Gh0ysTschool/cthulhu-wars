<script lang="javascript">
    import Map from './Map.svelte'
    import Player from './Player.svelte'
    import places from './places.js'
    import factions from './factions.js'
    import phases from './phases.js'
    import Unit from './Unit.svelte'
    import faction from './bg'
    
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

    let client = new URLSearchParams(window.location.search).get('faction')||'observer'
    let helpers = {
        'waiting...':f=>false,
        findPlyr : (name) => G.state.players.find( p => p.faction.name == name),
        forceRerender : () => { H.push(); G = G },
        initGame : () => {
            G.ritualtracks = {
                3:[5,6,7,8,9,10],
                4:[5,6,7,7,8,8,9,10],
                5:[5,6,6,7,7,8,8,9,9,10],
            }
            G.rituals = 0
            phases.init(G,helpers)
            factions(G,phases,helpers)
            G.state.players = Object.values(G.factions).map( f => ({ units:[],faction:f,doom:0,power:8,books:[],temp:{} }))
            G.state.players.map( p => {
                p.units = Array(6).fill(null).map( u => helpers.unit('cult',p.faction.name,p.faction.start) )
                p.units[2].gate=p.faction.start
                places[p.faction.start].gate=1
                p.faction.initUnits(p)
            })
            G.state.turn = {lim:1,pi:G.state.players.indexOf(helpers.findPlyr('gc'))||0}
            G.state.phase = 'action'
            G.state.stage = 'start'
        },
        log:f=>console.log(G,H,phases),
        push:f=>{firebase.database().ref('game/' + 1).set(JSON.stringify({...G.state,sender:client}))},
        pull:f=>firebase.database().ref('game/' + 1).on('value',g=>{ 
            if (JSON.parse(g.val()).sender == client) return
            let books = []
            JSON.parse(g.val()).players.map( p => p.books.map( b => { if( !H.findPlyr(p.faction.name).books.includes(b) ) books.push[b] }) )
            G.state = JSON.parse(g.val()); 
            books.map( b => H[b]())
        } ),
        newGame : () => { H.initGame(G); H.push() },
        genId : () => {},
        unit : ( type = '', owner = {}, place = '', cost = 0, fight = 0, tier = 0, gather = 0) => ({ id:genid(), type, owner, place, cost, fight, gather, tier, gate:0 })
    }
    window.H = helpers
    let genid = f => nonce++
    
    
    let players, turn, phase, stage, choices, units, player, nonce = 0
    let G = {phases, player, units, state:{ choices, players, places, phases, turn, phase, stage}}
    helpers.initGame()
    H.pull()
    let actions = []
    let choose = x => {}
    let noop = (np,c) => {}
    let clientCheck = (func) => () => {if(G.player.faction.name==client) func()}
    let click = action => f => {if (G.player.faction.name==client) H.choose(G.state.stage,action) }

    $: G.player = G.state.players[G.state.turn.pi%G.state.players.length]
    $: G.units = G.state.players.reduce((acc,cur)=>[...acc,...cur.units],[])
    $: G.ritualcost = G.ritualtracks[G.state.players.length][G.rituals]
    $: G.actions = (G.state.stage == '') ? G.phases[G.state.phase]?.options()||[] : G.phases[G.state.phase].stages[G.state.stage]?.options()||[]
    $: H.choose = ((G.state.stage == '') ? G.phases[G.state.phase]?.moves?.choose||noop : G.phases[G.state.phase].stages[G.state.stage]?.moves?.choose)||noop
    
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
    Map(choose='{H.choose}' units='{G.units}' places='{G.state.places}')
    .hud
        +each('G.state.players as player (player.faction.name)')
            Player(choose='{H.choose}' '{player}' '{G}')
        .actions(style='color: {G.player.faction.color}') actions
            ul(style='padding:0')
                +each('G.actions as action')
                    +if('G.state.stage.includes("unit")')
                        li(on:click='{click(action)}' style='color:{H.findPlyr(action.owner).faction.color}') {action.type} in {action.place||"pool"}
                        +elseif('G.state.stage.includes("player") || G.state.stage.includes("enemy") || G.state.stage.includes("faction")')
                            li(on:click='{click(action)}' style='color:{action.faction.color}') {action.faction.name}
                            +else
                                li(on:click='{click(action)}') {action}
                +if('G.phases[G.state.phase]?.stages[G.state.stage]?.moves?.done')
                    li(on:click='{clientCheck(G.phases[G.state.phase].stages[G.state.stage].moves.done)}') done
                    +elseif('G.phases[G.state.phase]?.moves?.done')
                        li(on:click='{clientCheck(G.phases[G.state.phase].moves.done)}') done
    </template>
