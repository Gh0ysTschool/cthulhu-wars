import bg from './bg.js'
import cc from './cc.js'
import gc from './gc.js'
import ys from './ys.js'
let factions = (G,phases) => G.factions = {bg:bg(G,phases),cc:cc(G,phases),gc:gc(G,phases),ys:ys(G,phases)}
export default factions