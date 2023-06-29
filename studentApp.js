let express = require("express");

let app = express();

app.use(express.json());

app.use(function (req, res, next) {

res.header("Access-Control-Allow-Origin","*");

res.header(

"Access-Control-Allow-Methods",

"GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"

);

res.header(

"Access-Control-Allow-Headers",

"Origin, X-Requested-With, Content-Type, Accept"

);

next();

});
let {students,customers,courses,faculties,classes}=require("./studentInfo.js");
// const { Pagination } = require("react-bootstrap");
var port=process.env.port || 2410;
app.listen(port, () => console.log(`Listening on port ${port}!`));


// console.log(customers);

app.post("/login",function(req,res){
    let email=req.body.email;
    let password=req.body.password;
    console.log(email,password);
    let customer=customers.find(k=>k.email===email && k.password===password);
    if(customer){
       var custInfo={
        name:customer.name,
        email:customer.email,
        role:customer.role,
       }
       res.send(custInfo);
    }
    else{
        res.status(500).send("No Record found");
    }
});
app.post("/register",function(req,res){
    let email=req.body.email;
    let password=req.body.password;
    let role=req.body.role;
    let name=req.body.name;
    console.log(email,password);
    let customer=customers.find(k=>k.email===email);
    if(customer){
       res.status(400).send("Email address is already exist.");
    }
    else{
        let customer={
            name:name,
            password:password,
            email:email,
            role:role,
        };
        let maxCustId=customers.reduce((acc,curr)=>acc>curr.custId?acc:curr.custId,0);
        customers.push({custId:maxCustId+1,...customer});
        if(role==="student"){
            delete customer.password;
            delete customer.role;
            delete customer.email;
            customer.courses=[];
            let maxStudId=students.reduce((acc,curr)=>acc>curr.id?acc:curr.id,0);
            students.push({id:maxStudId+1,...customer})
        }
        else if(role==="faculty"){
            delete customer.password;
            delete customer.role;
            delete customer.email;
            customer.courses=[];
            let maxFacId=faculties.reduce((acc,curr)=>acc>curr.id?acc:curr.id,0);
            faculties.push({id:maxFacId+1,...customer})
        }
        res.status(200).send({
            name:name,
            email:email,
            role:role,
        });
    }
});
app.get("/students",function(req,res){
    const course=req.query.course;
        let resArr=students;
        let courseArr=course? course.split(","):[];
        resArr=course?  resArr.filter(k=>courseArr.find(j=>k.courses.find(t=>t===j))):resArr;
        resArr.sort((s1, s2) => +s1.id - +s2.id);
        let result=Pagination(resArr,parseInt(req.query.page));
        console.log("Array",result);
        res.json({
        page: parseInt(req.query.page),
        items:course || req.query.page? result:students,
        totalItems: result.length,
        totalNum:course? resArr.length :students.length,
      });
});
app.get("/customers",function(req,res){
    res.send(customers);
});
app.get("/courses",function(req,res){
    res.send(courses);
});
app.get("/classes",function(req,res){
    res.send(classes);
});
app.get("/faculties",function(req,res){
   const course=req.query.course;
        let resArr=faculties;
        let courseArr=course? course.split(","):[];
        resArr=course?  resArr.filter(k=>courseArr.find(j=>k.courses.find(t=>t===j))):resArr;
        resArr.sort((s1, s2) => +s1.id - +s2.id);
        let result=Pagination(resArr,parseInt(req.query.page));
        console.log("Array",result);
        res.json({
        page: parseInt(req.query.page),
        items:course || req.query.page? result:faculties,
        totalItems: result.length,
        totalNum:course? resArr.length :faculties.length,
      });
});

function Pagination(arr,page){
  const postCount=arr.length;
  const perPage=3;
  var resArr=arr;
  resArr=resArr.filter((k,index)=>index>=page*3-3 && index<page*3);
  return resArr;
};

app.get("/assignStudForm/:code",function(req,res){
    const code=req.params.code;
    let course=courses.find(k=>k.code===code);
    if(course)res.send(course);
    else{
        res.status(404).send("Not Found");
    }
});
app.get("/assignFacultiesForm/:code",function(req,res){
    const code=req.params.code;
    let course=courses.find(k=>k.code===code);
    if(course)res.send(course);
    else{
        res.status(404).send("Not Found");
    }
});
app.put("/assignStudForm/:code",function(req,res){
    const code=req.params.code;
    let body=req.body;
    let name=body.name;
    let studentArr=body.students;
    let course=courses.find(k=>k.code===code);
    let newbody={courseId:course.courseId,faculity:course.faculty,...body};
    if(course){
     let index=courses.findIndex(k=>k.code===code);
     courses[index]=newbody;
    let studentToCheck= students.filter(k=>studentArr.find(j=>j===k.name));
    // console.log(studentToCheck);
    for(let i=0;i<studentToCheck.length;i++){
        studentToCheck[i].courses= !studentToCheck[i].courses?[]:studentToCheck[i].courses;
        let index=studentToCheck[i].courses.findIndex(k=>k===name);
        if(index===-1){
            studentToCheck[i].courses.push(name);
        }
    }
     res.send(newbody);
    }
    else{
        res.status(404).send("Not Found");
    }
});
app.put("/assignFacultiesForm/:code",function(req,res){
    const code=req.params.code;
    let body=req.body;
   let name=body.name;
    let facultyArr=body.faculty;
    let course=courses.find(k=>k.code===code);
    let newbody={courseId:course.courseId,students:course.students,...body};
    if(course){
     let index=courses.findIndex(k=>k.code===code);
     courses[index]=newbody;
      let facultyToCheck= faculties.filter(k=>facultyArr.find(j=>j===k.name));
    // console.log(facultyToCheck);
    for(let i=0;i<facultyToCheck.length;i++){
        facultyToCheck[i].courses= !facultyToCheck[i].courses?[]:facultyToCheck[i].courses;
        let index=facultyToCheck[i].courses.findIndex(k=>k===name);
        if(index===-1){
            facultyToCheck[i].courses.push(name);
        }
    }
     res.send(newbody);
    }
    else{
        res.status(404).send("Not Found");
    }
});
app.get("/getStudentCourse/:name",function(req,res){
    let name=req.params.name;
    let studentCourses=courses.filter(k=>k.students.find(j=>j===name));
    if(studentCourses){
        res.send(studentCourses);
    }
    else{
        res.status(404).send("Not enrolled in any course.")
    }
});
app.get("/getStudentClass/:name",function(req,res){
    let name=req.params.name;
    let studentCourses=courses.filter(k=>k.students.find(j=>j===name));
    if(studentCourses){
        let studentClasses=classes.filter(k=>studentCourses.find(j=>j.name===k.course));
        res.send(studentClasses);
    }
    else{
        res.status(404).send("Not enrolled in any course.")
    }
});
app.get("/getFacultyClass/:name",function(req,res){
    let name=req.params.name;
    let faculityClasses=classes.filter(k=>k.facultyName===name);
    if(faculityClasses){
        res.send(faculityClasses);
    }
    else{
        res.status(404).send("Not found")
    }
});
app.get("/getStudentDetails/:name",function(req,res){
    let name=req.params.name;
    let studentDetails=students.find(k=>k.name===name);
    if(studentDetails){
        res.send(studentDetails);
    }
    else{
        res.status(404).send("Not Found.")
    }
});
app.get("/getFacultyCourse/:name",function(req,res){
    let name=req.params.name;
    let faculityCourses=courses.filter(k=>k.faculty.find(j=>j===name));
    if(faculityCourses){
        res.send(faculityCourses);
    }
    else{
        res.status(404).send("Not Found.")
    }
});
app.post("/postClass",function(req,res){
    let body=req.body;
    let maxId=classes.reduce((acc,curr)=>acc>curr.classId?acc:curr.classId,0);
    let newClass={classId:maxId+1,...body};
    classes.push(newClass);
    res.send(newClass);
});
app.put("/postClass/:classId",function(req,res){
    let classId=+req.params.classId;
    let body=req.body;
    let index=classes.findIndex(k=>k.classId===classId);
    if(index>-1){
        classes[index]={classId:classId,...body};
        res.send({classId:classId,...body});
    }
    else{
      res.status(404).send("Not Found");
    }
});
app.get("/postClass/:classId",function(req,res){
    let classId=+req.params.classId;
    let index=classes.findIndex(k=>k.classId===classId);
    if(index>-1){
        res.send(classes[index]);
    }
    else{
      res.status(404).send("Not Found");
    }
});
app.post("/postStudentDetails",function(req,res){
    let body=req.body;
    let name=body.name;
    let dob=body.dob;
    let gender=body.gender;
    let about=body.about;
    let student=students.find(k=>k.name===name);
    if(student){
        let index=students.findIndex(k=>k.name===name);
        student.dob=dob;
        student.gender=gender;
        student.about=about;
        student.courses=!student.courses?[]:student.courses;
        students[index]=student;
        res.status(200).send(student);
    }
    else{
        res.status(404).send("Not Found");
    }
});