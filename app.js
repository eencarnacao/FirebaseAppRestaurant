  /*Configuración del sistema gestor de base de datos: Firebase*/
  const config = {
    apiKey: "AIzaSyB7dw49nHdAJcYFWVI-vFLrt_kf2_xBl0w",
    authDomain: "restaurante-522b9.firebaseapp.com",
    databaseURL: "https://restaurante-522b9.firebaseio.com",
    projectId: "restaurante-522b9",
    storageBucket: "restaurante-522b9.appspot.com",
    messagingSenderId: "136888241015"
  };
  /*Inicialización de la base de datos*/
  firebase.initializeApp(config);
  
  // Refrerencia hacia la base de datos, en la seción de comments
  const databaseRefComments = firebase.database().ref('comments');
  /*Obtención de elementos del DOM por medio de su ID, estos se guardan en contantes con nombre 
  para identificarlos más adelante en el código*/
  const nameInput = document.getElementById("name");
  const commentsInput = document.getElementById("comment");
  const textSesion = document.getElementById("textoSesion");

  /*Variable que hace referencial al usuario actual que esta autenticado*/
  var user = firebase.auth().currentUser;

  /*Función que observa si el estado de autenticación de un usuario cambio*/
  firebase.auth().onAuthStateChanged(user => {
    let nameUser;
    if(user){
      if(user.displayName!= null){
        nameUser = user.displayName;
      }
      else{
        nameUser = user.email;
      }
      nameInput.value = nameUser;      
      nameInput.setAttribute("disabled", "disabled");
      textSesion.innerText = "Cerrar sesión de Google";
      textSesion.setAttribute('href', 'javascript:cerrarSesion(this)');
      //check = true;
    }
    else{
      nameInput.value = "Anónimo";      
      nameInput.removeAttribute("disabled");
      textSesion.innerText = "Iniciar sesión con Google";
      textSesion.setAttribute('href', 'javascript:iniciarSesion(this)');
    }
  });
  /*Función para iniciar sesión mediante Google*/
  function iniciarSesion() {
    /*Constante que almacena una nueva instancia del proveedor de autenticación*/
    const provider = new firebase.auth.GoogleAuthProvider(); 
    //Autenticación a través de un POP UP
    firebase.auth().signInWithPopup(provider).then((result) =>{
    // Credencial de Google que contiene el token de acceso de Google.
    let credential = result.credential;
    // Token de Google generado.
    var token = result.credential.accessToken;
    // Información del usuario que esta autenticandose.
    var user = result.user;
    /*Variables locales que alamacenan algunos datos del usuarios como son : nombre de usuario, email 
    y foto de su cuenta de Google*/
    let userName = result.user.displayName;
    let email = result.user.email;
    var photo = result.user.photoURL;
    //Impresion en consola del email y su nombre de usuario, para comprobar que este se ha autenticado correctamente.
    console.log(`${result.user.email} ha iniciado sesion`);
    console.log(`${result.user.displayName} ha iniciado sesion`);
    //Función interna que hace referencia a la sección de users, para almacenar los datos del usuario en la BD
    firebase.database().ref('users/' + userName).update({
      username: userName,
      email: email,
      foto: photo
      });       
    })
    //Si existe algún error en la autenticacioń este es mostrado en consola
    .catch(error => console.error(`Error : ${error.code}: ${error.message}`));
  } 
  /*Función de cerrar sesión de Google*/
  function cerrarSesion() {
    /*Función interna para salir de la sesión almacenada por firebase*/
    firebase.auth().signOut()
      .then(() =>{
        /*Impresión en consola para comprobar que el usuario ha salido de su cuenta de google*/
        console.log('te has deslogeado')
        //Setear los campos de entrada de nombre de usuario y comentarios a vació.
        nameInput.value = '';
        commentsInput.value = '';
        location.reload();
    }).catch(error => console.error(`Error : ${error.code}: ${error.message}`));      
  }

  //Función timeStamp para agregar fecha y hora al comentario.
  const timeStamp = () => {
  let options = {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute:'2-digit'
  };
  //Asiganación de zona horaria, para obtener la fhora y fecha de acuerdo a la zona horaria especificada.
  let now = new Date().toLocaleString('es-MX', options);
  return now;
  };
  //Función para postear un comentario.
  function postComment() {
    //Variables locales que almacenan los valores de los elementos con el id name y comment.
    let name = nameInput.value;
    let comment = commentsInput.value;
    //Si las variables name y comment son diferente de nulas
    if (name && comment) {
      /*Son almacenados los datos de nombre de usuario, comaentario y hora y fecha de comentario en la BD
      en la sección de comments*/
      databaseRefComments.push({
        name: name,
        comment: comment,
        time: timeStamp()
      });     
    }
    //Setear los campos de entrada de nombre de usuario y comentarios a vació.
    nameInput.value = '';
    commentsInput.value = '';      
  };
  //Función que se ejecuta cuando se han agregado elementos a la BD en la sección de comments.
  databaseRefComments.on("child_added", snapshot => {
    //Variable local que almacena una captura de los datos del comentario que se realizado hace un instante.
    let comment = snapshot.val();
    /*Llamada a la función de addComment, se envían los parámetros de nombre de usaurio,
     comentario y fehca-hora de comentario*/
    addComment(comment.name, comment.comment, comment.time);
  });
  /*Función para mostrar abajo del formulario, el historial de comentarios realizados*/
  const addComment = (name, comment, timeStamp) => {
  //Referencia a la sección del DOM con el ID comments
  let comments = document.getElementById("comments");
  /*En dicho elemento se seteara etiquetas HTML con el contenido de el nombre de usuario, 
  el comentario y la fehca y hora del comentario.*/
  comments.innerHTML = `<hr>        
    <span id="horaComentario">${timeStamp}</span> <h5 id="nameUser">${name} </h5>
    <p id="comentarioUser"> ${comment}</p>${comments.innerHTML}
    `;
  }

 