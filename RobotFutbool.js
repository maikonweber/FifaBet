const puppeter = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const moment = require('moment');
const { table } = require('console');
const redis = require('redis');


class FootBoolScrap {
    constructor(password, username) {
        this.password = password;
        this.username = username;
   
    }

    async init() {
        const browser = await puppeter.launch({
            userDataDir : './userData', 
            headless: true,
            defaultViewport: {
                width: 1920,
                height: 1080
            },
            args: [
              '--use-gl=egl',
               '--no-sandbox',
              '--disable-features=IsolateOrigins,site-per-process',
                '--disable-extensions',
                "--window-size=1520,980",
                "--window-position=0,0",

            ],  
            devTools: true, 
              
          });
        const page = await browser.newPage();
        this.page = page;
        this.browser = browser;
        return page;

        }


        async getPage(page) {
            console.log('getPage');
            await page.goto('https://www.bet365.com/#/IP/B1', {waitUntil: 'networkidle2'});
            return page;
          
        
            }
        
        async getScrap(page) {
            console.log('getScrap');
            const element = await page.$$('.ovm-CompetitionList'); // List of all
            const element2 = await page.$$('.ovm-Competition.ovm-Competition-open ');
            let own = '.ovm-FixtureDetailsTwoWay.ovm-FixtureDetailsTwoWay-1' // Time and score
            let wolf ='.ovm-HorizontalMarket ' // 
            let tigre ='.ovm-StandardScores_ScoresWrapper'
            let elefant ='.ovm-FixtureDetailsTwoWay_PeriodWrapper'
            let leon = '.ovm-FixtureDetailsTwoWay_AdditionalInfoInner'
            let bear = '.ovm-ParticipantOddsOnly_Odds'
            let fish = '.ovm-FixtureDetailsTwoWay_TeamName '
            let bird = '.ovm-FixtureDetailsTwoWay_Timer.ovm-InPlayTimer '
            let kong = '.ovm-StandardScores_TeamOne'
            let monkey = '.ovm-StandardScores_TeamTwo'
            let rabbit = '.ovm-MediaIconContainer_Buttons '
            let apple = '.lv-LiveTabViewContainer '

            let wheelChart = '.ml-WheelChart ' 
            // Inside WheelChart
              let chartText =  '.ml-WheelChart_Text '
              let team1 = '.ml-WheelChart_Team1Text '
              let team2 = '.ml-WheelChart_Team2Text '

              let homeCards = '.ml1-StatsLower_MiniHomeWrapper '                  
              let awayCards = '.ml1-StatsLower_MiniAwayWrapper '

              let barCollection = '.ml1-StatsLower_MiniBarsCollection '
                  // inside bar
                  let inside1 = '.ml-ProgressBar_MiniBarValue.ml-ProgressBar_MiniBarValue-1 '
                  let inside2 = '.ml-ProgressBar_MiniBarValue.ml-ProgressBar_MiniBarValue-2 '
              let bar = '.ml1-StatsLower_MiniBarWrapper '


            var result = [];
            const rat = await element[0].$$('.ovm-Fixture.ovm-Fixture-horizontal.ovm-Fixture-media ');

            // For loop to get all the data
            for (let i = 0; i < rat.length; i++) {
              
              var obj = {
                TimeOne : '',
                TimeTwo : '',
                Time: '',
                ScoreOne: '',
                ScoreTwo: '',
                _1 : '',
                _2 : '',
                _3 : '',
                wheelChart : '',
                Card : '',
                Bar : '',
            };
            // Get the time and score
              
              
                const button = await rat[i].$$(rabbit);
                try {
                button[0].click();
                await page.waitForTimeout(700);

                let wheelChartArray = []
               


                let containetInfomation = await page.$$(apple);
                let wheelChartEx = await containetInfomation[0].$$(wheelChart);
                  let homeCardElement = await containetInfomation[0].$$(homeCards);
                  let awayCardElement = await containetInfomation[0].$$(awayCards);
                  let barElement = await containetInfomation[0].$$(barCollection);
                  
                  let barInside1 = await barElement[0].$$(inside1);
                  let barInside2 = await barElement[0].$$(inside2);
                  
                  let Bar = {
                      NoAlvoHome : '',
                      AoLadoHome : '',
                      NoAlvoAway : '',
                      AoLadoAway : '',
                    }



                  barInside1.forEach(async (element, index) => {
                    let bar = await element.getProperty('innerText');
                    let barText = await bar.jsonValue();
                    if (index == 0) {
                      Bar.NoAlvoHome = barText
                    }
                    if (index == 1) {
                      Bar.AoLadoHome = barText
                    }
                  });

                  barInside2.forEach(async (element, index) => {
                    let bar = await element.getProperty('innerText');
                    let barText = await bar.jsonValue();
                    if (index == 0) {
                      Bar.NoAlvoAway = barText
                    }
                    if (index == 1) {
                      Bar.AoLadoAway = barText
                    }
                  });
                
                    let elementValue = await homeCardElement[0].$$('.ml1-StatsColumn_MiniValue ');
                    let elementValue2 = await awayCardElement[0].$$('.ml1-StatsColumn_MiniValue ');

                    let Card = {
                      RedCardHome : "",
                      RedCardAway : "",
                      YellowCardHome : "",
                      YellowCardAway : "",
                      CornerHome : "",
                      CornerAway : ""
                    }

                    let cardRed = await elementValue[0].getProperty('textContent');
                    let cardYellow = await elementValue[1].getProperty('textContent');
                    let cardCorner = await elementValue[2].getProperty('textContent');

                    let cardRed2 = await elementValue2[0].getProperty('textContent');
                    let cardYellow2 = await elementValue2[1].getProperty('textContent');
                    let cardCorner2 = await elementValue2[2].getProperty('textContent');

                    Card.RedCardHome = await cardRed.jsonValue();
                    Card.RedCardAway = await cardRed2.jsonValue();
                    Card.YellowCardHome = await cardYellow.jsonValue();
                    Card.YellowCardAway = await cardYellow2.jsonValue();
                    Card.CornerHome = await cardCorner.jsonValue();
                    Card.CornerAway = await cardCorner2.jsonValue();

                
                    wheelChartEx.forEach(async (element) => {
                      let objWheel = {
                        text : '',
                        team1 : '',
                        team2 : '',
                      }

                       let text = await element.$$(chartText);
                        let teamOne = await element.$$(team1);
                        let teamTwo = await element.$$(team2);
                     let Etext = await text[0].getProperty('textContent');
                     let Eteam1 = await teamOne[0].getProperty('textContent');
                     let Eteam2 = await teamTwo[0].getProperty('textContent');
                      objWheel.text = await Etext.jsonValue();
                      objWheel.team1 = await Eteam1.jsonValue();
                      objWheel.team2 = await Eteam2.jsonValue();
                        
                        wheelChartArray.push(objWheel)

                    })
                    obj.Bar = Bar;
                    obj.Card = Card;
                    obj.wheelChart = wheelChartArray;

                    } catch (error) {
                    console.log(error)
                }

              
                
                const element = await rat[i].$(own);
                const element2 = await rat[i].$(tigre)
                const element3 = await rat[i].$(elefant)
                const element4 = await rat[i].$(leon)
                const element5 = await rat[i].$$(bear)
               
              
                let rino = await element.$$(fish);
              
                rino[0].getProperty('textContent').then(async function(text) {
                    obj.TimeOne = await text.jsonValue();
                });
                rino[1].getProperty('textContent').then(async function(text) {
                 
                    obj.TimeTwo = await text.jsonValue();
                });

                let shark = await element.$$(bird);
                
                shark[0].getProperty('textContent').then(async function(text) {
                    obj.Time = await text.jsonValue();
                });

                let sheep = await element.$$(kong);
                let orm = await element.$$(monkey);
                
                sheep[0].getProperty('textContent').then(async function(text) {
                    
                    obj.ScoreOne = await text.jsonValue();
                });

                orm[0].getProperty('textContent').then(async function(text) {
                    obj.ScoreTwo = await text.jsonValue();
                });
                
                let box = [];

                for (let i = 0; i < element5.length; i++) {
                  let text5 = await element5[i].getProperty('textContent');
                  let stract5 =  await text5.jsonValue();
                  box.push(stract5)
                }
                
                obj._1 = box[0];
                obj._2 = box[1];
                obj._3 = box[2];
                result.push(obj);
              };

              console.log(result)
              return result;

        

        }

     
          async publisher(message) {

            const publish = redis.createClient({
              host: 'localhost',
              port: 6379,
              password: "roullet" 
            });
          
            
            await publish.connect();
            await publish.publish('bet365events', message);
          
        }


        async start() {
          const page = await this.init();
          const page2 =  await this.getPage(page);
          const result = await this.getScrap(page2);
          await console.log(result)
        }
      }

module.exports = FootBoolScrap;

