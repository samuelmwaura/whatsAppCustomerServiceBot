const request = require('request');
const sendingHandler = require('../sendingHandler');
const {customer,stage, session}=require('../models/databaseModel');


//HANDLER FOR HOMEPAGE REQUEST
const receiverFunction = (req,res)=>{
    res.send('Testing testing ');
}    


//HANDLER FOR THE API CALLBACKS
const handlerFunction= (req,res)=>{   
    console.log(req.body.event);

//REPLY FUNCTION
    const sendingFunction=()=>{   
        sendingHandler.options.body=JSON.stringify(messageObject)
        request.post(sendingHandler.options,sendingHandler.onResponseReceipt);
        console.log( messageObject.messages[0].content);
    }

//RESPONSE BODY 
    let messageObject= {
        "messages": [
           {
           "channel": "whatsapp",
           "to": "254703674306",      
           }
        ]        
    }

    const customerFeedback= req.body.event.moText[0].content;//the message from the customer.
    const customerPhone= req.body.event.moText[0].from;//the customer number.

    //HOME FUNCTION
    const homefunction=()=>{
        messageObject.messages[0].content=`Kenya Power(KPLC.).\nPlease reply with a service number:\n1. Buy tokens.\n2. Report Outages.\n3. Check meter status.`
        stage.update({stage:'1'},{where:{customerPhone}}).then().catch(sendingHandler.errorFunction); 
      }
    
    //TERMINATION FUNCTION-when the customer has reached the termination of a converation.
    const endSession=(sessionStages,lastStep)=>{
        session.create({steps:sessionStages+'*'+lastStep,customerPhone}).then(()=>{
        stage.update({stage:'1'},{where:{customerPhone}}).then(()=>console.log('Conversation ended successfully')).catch(sendingHandler.errorFunction);
        }).catch(sendingHandler.errorFunction);
    }   

//SET TIMEOUT FUNCTION AND CALL - Customer stopped before the conversation is over
const sessionTimeout=()=>{
    stage.findOne({where:{customerPhone}}).then((sessionStages)=>{
        endSession(sessionStages.stage,'1');
        messageObject.messages[0].content='You stayed for too long without replying,Please begin another session:\n1. Buy tokens.\n2. Report Outages.\n3. Check meter status.';
        sendingFunction();
        }).catch(sendingHandler.errorFunction);
  }

setTimeout(sessionTimeout,60000);

    //CHECK FOR THE CUTOMER STAGE AND RESPOND---NOW IN THE MAIN BODY LOGIC
    customer.findOne({where:{phone:customerPhone}}).then(existingCustomer=>{
        if(existingCustomer){//AN EXISITING CUTOMER
            stage.findOne({where:{customerPhone:customerPhone}}).then(customerStage=>{  
         switch (customerStage.stage){

             //IF AT THE VERY FIRST STAGE.
            case '0':
                customer.update({firstName:customerFeedback},{where:{phone:customerPhone}}).then((updatedCustomer)=>{
                stage.update({stage:'1'},{where:{customerPhone:customerPhone}}).then(()=>{
                messageObject.messages[0].content=`Welcome ${customerFeedback}: Kenya Power(KPLC.). Please reply with a service number:\n1. Buy tokens.\n2. Report Outages.\n3. Check meter status.`;
                sendingFunction();
                }).catch(sendingHandler.errorFunction);
                }).catch(sendingHandler.errorFunction);
            
            break;

            //AT THE HOME STAGE MENU
            case '1':
                switch(customerFeedback){                    
                case '1'://Buy tokens
                messageObject.messages[0].content=`1.Prepaid Tokens.\n2.PostPaid Tokens.\n00.Home Menu`
            stage.update({stage:'1*1'},{where:{customerPhone:customerPhone}}).then(()=>{
                console.log('This is Level 2 display.');
            }).catch(sendingHandler.errorFunction);
                break;

                case '2'://report outages.
                messageObject.messages[0].content=`Select the Region with an outage region.\n1.Central.\n2.Nyanza.\n00.Home Menu`
            stage.update({stage:'1*2'},{where:{customerPhone:customerPhone}}).then(()=>{
            }).catch(sendingHandler.errorFunction);
                break;
                case '3'://checking the meter status
                messageObject.messages[0].content=`1.Enter your meter number.`
             stage.update({stage:'1*3'},{where:{customerPhone:customerPhone}}).then(()=>{
            }).catch(sendingHandler.errorFunction);                
                break;   
                case '00':
                messageObject.messages[0].content=`Kenya Power(KPLC.). Please reply with a service number:\n1. Buy tokens.\n2. Report Outages.\n3. Check meter status.`      
                 break;
                default:
                messageObject.messages[0].content=`Please enter a valid choice for service.\n1. Buy tokens.\n2. Report Outages.\n3. Check meter status.`      
                break;                            
                }
                sendingFunction(); 
                break;

                //LEVEL 2 PROCESSING
                case '1*1':
            switch(customerFeedback){
                case '1':
                    messageObject.messages[0].content=`1.Buy from M-Pesa.\n2.Buy from Bank\n00.Home Menu`
                    stage.update({stage:'1*1*1'},{where:{customerPhone}}).then().catch(sendingHandler.errorFunction);

                break;
                case '2':
                    messageObject.messages[0].content=`1.Agent Purchase`;
                    stage.update({stage:'1*1*2'},{where:{customerPhone}}).then().catch(sendingHandler.errorFunction);

                break;
                case '00':
                    homefunction(); 
                    break;
                default:
                    messageObject.messages[0].content=`Reply With a valid Choice:\n1.Prepaid Tokens.\n2.PostPaid Tokens..\n00.Home Menu`;
                break;
            }
            sendingFunction();

            break;        
            case '1*2':
                switch(customerFeedback){
                case '1':                
                messageObject.messages[0].content=`Select district within Central Region:\n1.Mathioya.\n00.Home Menu`
                stage.update({stage:'1*2*1'},{where:{customerPhone}}).then().catch(sendingHandler.errorFunction);
                break;

                case '2':
                messageObject.messages[0].content=`Select district within Nyanza Region:\n1.Awendo.\n00.Home Menu`
                stage.update({stage:'1*2*2'},{where:{customerPhone}}).then().catch(sendingHandler.errorFunction);
                break;
                case '00':
                    homefunction(); 
                    break;
                default:
                messageObject.messages[0].content=`Enter a Valid Region.\n1.Central.\n2.Nyanza.\n00.Home Menu`
                break;
            }
            sendingFunction();
            break;
            case '1*3':
                switch(customerFeedback){
                case '1':                
                messageObject.messages[0].content=`Status for meter ${customerFeedback} is: Recently Blocked \n00.Home Menu`
                stage.findOne({where:{customerPhone}}).then((sessionStages)=>{
                endSession(sessionStages.stage,'1');
                }).catch(sendingHandler.errorFunction);
                break;
                case '00':
                    homefunction(); 
                    break;
                default:
                messageObject.messages[0].content=`Enter a Valid meter number`
                break;
            }
            sendingFunction();
            break;
            case '1*1*1':
                switch(customerFeedback){
                    case '1':
                        messageObject.messages[0].content=`Please wait for an M-Pesa S.T.K push message to pay for the token.\n00:Home`
                        stage.findOne({where:{customerPhone}}).then((sessionStages)=>{
                    endSession(sessionStages.stage,'1');
                    }).catch(sendingHandler.errorFunction);
                    break;
                    case '2':
                        messageObject.messages[0].content=`A push from your bank is soon going to be sent.\n00:Home`
                        stage.findOne({where:{customerPhone}}).then((sessionStages)=>{
                    endSession(sessionStages.stage,'1');
                    }).catch(sendingHandler.errorFunction);
                    break;
                    case '00':
                        homefunction(); 
                        break;
                    default:
                        messageObject.messages[0].content=`Enter a Valid choice:\n1.Buy from M-Pesa.\n2.Buy from Bank\n00.Home Menu `
                        break;
                    }
                sendingFunction()  
            break;
            case '1*1*2':
                switch(customerFeedback){
                case '1':
                    messageObject.messages[0].content=`Please go to any Kenya Power Branded agent around and ask for the service.\n00.Home Menu`
                    stage.findOne({where:{customerPhone}}).then((sessionStages)=>{
                endSession(sessionStages.stage,'1');
                }).catch(sendingHandler.errorFunction);
                break;
                case '00':
                    homefunction(); 
                    break;
                default:
                    messageObject.messages[0].content=`Enter a Valid choice:\n1.Buy from M-Pesa.\n2.Buy from agent.\n00.Home Menu `
                    break;
                }
                sendingFunction();
                break;
            case '1*2*1':
                switch(customerFeedback){
                    case '1': 
                    messageObject.messages[0].content=`Outage notice sent successfully to the regional ofice.\n00.Home Menu `;
                    stage.findOne({where:{customerPhone}}).then((sessionStages)=>{
                        endSession(sessionStages.stage,'1');
                        }).catch(sendingHandler.errorFunction);
                    break;
                    case '00':
                        homefunction(); 
                    break;
                    default:
                        messageObject.messages[0].content=`Enter a Valid choice:\n1.Mathioya.\n00.Home Menu `
                    break;
                }
                sendingFunction();
                break;
            case '1*2*2':
                   switch(customerFeedback){
                     case '1':
                        messageObject.messages[0].content=`Outage notice sent successfully to the Awendo regional ofice.\n00.Home Menu `;
                        stage.findOne({where:{customerPhone}}).then((sessionStages)=>{
                            endSession(sessionStages.stage,'1');
                            }).catch(sendingHandler.errorFunction);   
                     break;
                     case '00':
                        homefunction();
                     break;
                     default:
                        messageObject.messages[0].content=`Enter a Valid choice:1.Awendo.\n00.Home Menu `   
                    break;
                   }
                   sendingFunction();
             } 
                                 
            

            }).catch(sendingHandler.errorFunction);
        }
    

        // CUSTOMER  NOT REGISTERED BEFORE
        else{
            customer.create({phone:customerPhone}).then(()=>{
            stage.create({customerPhone,stage:'0'}).then(()=>{
                messageObject.messages[0].content=`Kenya Power(KPLC.)\nPlease reply with your first Name.`               
              sendingFunction();
            }).catch(sendingHandler.errorFunction);
            }).catch(sendingHandler.errorFunction);
            
        }

    }).catch(sendingHandler.errorFunction);
   
    
                  
}

//HANDLE THE MESSAE STATUS CALLBACKS
const statusHandler=(req, res)=>{
  console.log(req.body.event.messageStatusUpdate[0]);

}

module.exports={
    receiverFunction,
    handlerFunction,
    statusHandler
}