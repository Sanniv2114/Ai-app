
//API controllers for creating a new chat
import Chat from '../models/Chat.js';
export  const createChat=async(req,res)=>{
       console.log("Chat coming...")
    try{

        const userId=req.user._id;

        const chatData={
            userId,
            messages:[],
            name:"New Chat",
            userName:req.user.name
        }
await Chat.create(chatData);
res.json({success:true,message:"New Chat Created"})

    }catch(error){

        res.json({success:false,message:error.message})
    }

}


//API controllers for fetching all chats of a user


export  const getChats=async(req,res)=>{

    try{
const userId=req.user._id;
        const chats=await Chat.find({userId}).sort({updatedAt:-1});
        res.json({success:true,chats});

        
        }

    catch(error){

        res.json({success:false,message:error.message})
    }

}

//API controllers for deleting a chat


export  const deleteChat=async(req,res)=>{

    try{
const userId=req.user._id;
       const {chatId}=req.body;

await  Chat.deleteOne({_id:chatId,userId});
res.json({success:true,message:"Chat Deleted"});
        }

    catch(error){

        res.json({success:false,message:error.message})
    }

}





