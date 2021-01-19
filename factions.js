import bg from './bg.js'
import cc from './cc.js'
import gc from './gc.js'
import ys from './ys.js'
let factions = (G,phases,H) => G.factions = {bg:bg(G,phases,H),cc:cc(G,phases,H),gc:gc(G,phases,H),ys:ys(G,phases,H)}
export default factions