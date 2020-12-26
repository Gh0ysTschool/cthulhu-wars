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
    let faction = {bookinit,books,bookreqs,goo,mons,color,start,name,units,addUnit,initUnits}
    return faction
}
export default faction