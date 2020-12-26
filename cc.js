let G
let phs
let faction = (g,p) => {
    G = g;
    phs = p
    let books = ["Abduct","Emissary of the Outer Gods","Invisibility","Madness","Seek and Destroy","The Thousand Forms"]
    let bookinit = {
        "Abduct":f=>{},
        "Emissary of the Outer Gods":f=>{},
        "Invisibility":f=>{},
        "Madness":f=>{},
        "Seek and Destroy":f=>{},
        "The Thousand Forms":f=>{}
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
    }
    let faction = {bookinit,books,bookreqs,goo,mons,color,start,name,units,addUnit,initUnits}
    return faction
}
export default faction