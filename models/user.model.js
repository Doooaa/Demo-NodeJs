import mongoose from "mongoose";
import bcrypt from "bcryptjs";
bcrypt.genSalt(12).then(salt => {
  console.log(salt);
}).catch(err => {
  console.error('Error generating salt:', err);
});
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A user must have a name'],
        trim:true
    },
    email:{
        type:String,
        required:[true,'A user must have an email'],
        unique:true,
        lowercase:true,
        validate:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    password:{
        select:false, // Hide the password field by default when querying the user
        type:String,
        required:[true,'A user must have a password'],  
        minlength:6,
        validate:[/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character']
    },
    confirmPassword:{
        type:String,
        required:[true,'A user must confirm the password'],
        // This only works on CREATE and SAVE!!! not on UPDATE operations 
        // ** We need to use a function here because we need access to the current 
        // document (this) to compare the password and passwordConfirm fields **
        validate:{
            validator:function(el){
                return el===this.password;},
            message:'Passwords are not the same!'
        }
    }
})
// Encrypt the password before saving the user document
userSchema.pre('save', async function() {
    //if use asychronous function we need to use next() to move to the next middleware 
    // but if we use regular function we don't need to use next() because mongoose will
    //  automatically move to the next middleware after the pre hook is executed
  if (!this.isModified('password')) return ;

  this.password = await bcrypt.hash(this.password, 12);
  console.log(this.password)
  // Delete the confirmPassword field after validation since we don't need to store it in the database 
  this.confirmPassword = undefined;

});

 userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    //candidatePassword  ( not decrpted pass )is the password that the user is trying to log in with and userPassword is the hashed password stored in the database
    return await bcrypt.compare(candidatePassword,userPassword);
 }




const User=mongoose.model('User',userSchema);
export default User;