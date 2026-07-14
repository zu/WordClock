const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const LEDMATRIX_NUM_ROWS = 10;
const LEDMATRIX_NUM_COLS= 11;

let clock;
const NUM_LEDS = LEDMATRIX_NUM_ROWS*LEDMATRIX_NUM_COLS + 4;

if (IS_DEVELOPMENT) {
    clock = require('./mock-clock');
} else {
    const { Dotstar } = require('dotstar');
    const SPI = require('pi-spi');
    const spi = SPI.initialize('/dev/spidev0.0');
    clock = new Dotstar(spi, {
        length: NUM_LEDS
    });
}

const ES_ISCH = [99, 100, 102, 103, 104, 105];
const VIERTEL = [98, 97, 96, 95, 94, 93, 92];
const FOEIF = [91, 90, 89, 88];
const ZAEH = [78, 79, 80];
const ZWAENZG = [82, 83, 84, 85, 86, 87];
const VOR = [73, 72, 71];
const AB = [69, 68];
const HALBI = [55, 56, 57, 58, 59];
const NUENI = [61, 62, 63, 64];
const EIS = [54, 53, 52];
const DRUE = [51, 50, 49];
const FOEIFI = [48, 47, 46, 45, 44];
const ZWEI = [33, 34, 35, 36];
const SAECHSI = [37, 38, 39, 40, 41, 42];
const VIERI = [32, 31, 30, 29, 28];
const ZWOELFI = [27, 26, 25, 24, 23, 22];
const ELFI = [11, 12, 13, 14];
const SIEBNI = [15, 16, 17, 18, 19, 20];
const ACHTI = [10, 9, 8, 7, 6];
const ZAEHNI = [4, 3, 2, 1, 0];

const DOTS = [111, 110, 113, 112];

let startupCounter = 0;

function run() {
    setInterval(() => {
        if (startupCounter < NUM_LEDS) {
            clock.all(0, 0, 0);
            clock.set(startupCounter, 255, 255, 255);
            startupCounter++;
            clock.sync();
            return;
        }
        
        let timerepr = [];
        let dotrepr = [];
    
        const date = new Date();
    
        let h = date.getHours();
        const min = date.getMinutes();
    
        timerepr.push(ES_ISCH);
    
        if ( min >= 25 ) {
            h++;
        }
      
        if (   ( min >=  5 && min < 25 )
            || ( min >= 35 && min < 40 )
        ) {
            timerepr.push(AB);
        } else if (   ( min > 22 && min < 30 )
                   || ( min >= 35 && min < 60 )
        ) {
            timerepr.push(VOR);
        }
            
        if (   ( min >=  5 && min < 10 ) 
            || ( min >= 25 && min < 30 )
            || ( min >= 35 && min < 40 )
            || ( min >= 55 && min < 60 )
        ) {
            timerepr.push(FOEIF);
        }
        else if (   ( min >=  5 && min < 15 ) 
                 || ( min >= 50 && min < 55 )
        ) {
            timerepr.push(ZAEH);
        }
        else if (   ( min >= 15 && min < 20 ) 
                 || ( min >= 45 && min < 50 )
        ) {
            timerepr.push(VIERTEL);
        }
        else if (   ( min >= 20 && min < 25 ) 
                 || ( min >= 40 && min < 45 )
        ) {
            timerepr.push(ZWAENZG);
        }
        
        if (   ( min >= 25 && min < 40 ) 
        ) {
            timerepr.push(HALBI);
        }
            
        switch (h) {
            case 0:
            case 12:
            case 24:
                timerepr.push(ZWOELFI);      
                break;
            case 1:
            case 13:
                timerepr.push(EIS);
                break;
            case 2:
            case 14:
                timerepr.push(ZWEI);
                break;
            case 3:
            case 15:
                timerepr.push(DRUE);
                break;
            case 4:
            case 16:
                timerepr.push(VIERI);
                break;           
            case 5:
            case 17:
                timerepr.push(FOEIFI);
                break;
            case 6:
            case 18:
                timerepr.push(SAECHSI);
                break;
            case 7:
            case 19:
                timerepr.push(SIEBNI);
                break; 
            case 8:
            case 20:
                timerepr.push(ACHTI);
                break;
            case 9:
            case 21:
                timerepr.push(NUENI);
                break;
            case 10:
            case 22:
                timerepr.push(ZAEHNI);
                break;
            case 11:
            case 23:
                timerepr.push(ELFI);
                break;            
            default:
                break;
        }

        if (min%5 > 0) {
            dotrepr.push(DOTS[0]);
        }

        if (min%5 > 1) {
            dotrepr.push(DOTS[1]);
        }

        if (min%5 > 2) {
            dotrepr.push(DOTS[2]);
        }

        if (min%5 > 3) {
            dotrepr.push(DOTS[3]);
        }


        clock.all(0, 0, 0);
        for (const led of [].concat(...timerepr)) {
            clock.set(led, 255, 255, 255);
        }

        for (const led of [].concat(...dotrepr)) {
            clock.set(led, 51, 51, 51);
        }

        clock.sync();

    }, 100);
}

run();