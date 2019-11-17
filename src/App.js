import React from 'react'; 
import axios from 'axios';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap';



class App extends React.Component {
	
	    /****************************************************************************
		*		Declaramos todo lo necesario para las funciones de la App.			*
		*		empresa será un arreglo vacio, el cual se poblará mas adelante		*
		*		infoNuevaEmpresa son los campos que tendrá el modal para crear		*
		*		modificaEmpresa son los campos que tendrá el modal para modificar	*
		*		nuevaEmpresaModal es el estado en que iniciará el mismo				*
		*		modificaEmpresaModal es el estado en que iniciará el mismo			*
		****************************************************************************/	
	state = {
		empresa: [],
		infoNuevaEmpresa: {
			nombre:'',
			numero_trabajadores:''
		},
		modificaEmpresa: {
			id:'',
			nombre:'',
			numero_trabajadores:'',
			created_at: ''
		},
		nuevaEmpresaModal: false,
		modificaEmpresaModal: false
		
	}
	
	    /****************************************************************************
		*	componentDidMount es lo que mostrará la pagina en su primera carga		*
		*	En este caso será el metodo '_actualizaEmpresas()' (explicada mas abajo)*
		****************************************************************************/
	componentDidMount(){
		this._actualizaEmpresas();
	}
	
		/****************************************************************************
		*	toggleNuevaEmpresa es el switch de la ventana modal, que se crea   		*
		*	al momento de presionar el boton para crear una empresa					*
		*	Con este toggle se activara o desactivará el modal.						*
		****************************************************************************/	
	toggleNuevaEmpresa(){
		this.setState({
			nuevaEmpresaModal: ! this.state.nuevaEmpresaModal
		});
	}
	
		/****************************************************************************
		*	toggleModificaEmpresa es el switch de la ventana modal, que se crea  	*
		*	al momento de presionar el boton para modificar una empresa				*
		*	Con este toggle se activara o desactivará el modal.						*
		****************************************************************************/
	toggleModificaEmpresa(){
		this.setState({
			modificaEmpresaModal: ! this.state.modificaEmpresaModal
		});
	}
	
		/****************************************************************************
		*	agregaEmpresa es el metodo que agrega la empresa por medio del		 	*
		*	RESTful API. Recibe todos los parametros desde el FormGroup/Modal 		*
		*	que se encuentran en el render de la pagina.							*
		*	Una vez recibidos los parametros, valida que vengan correctamente		*
		*	Si está todo ok, consume el webservice, sino, envia el error			*	
		****************************************************************************/
	agregaEmpresa(){
		let validado = this.valida(this.state.infoNuevaEmpresa.nombre,this.state.infoNuevaEmpresa.numero_trabajadores);		
		if (validado===true){
		axios.post('http://192.168.1.13:8000/api/empresa', this.state.infoNuevaEmpresa).then((respuesta) => {
			let { empresa } = this.state;
			empresa.push(respuesta.data);
			this.setState({ empresa, nuevaEmpresaModal: false, infoNuevaEmpresa: {
			nombre:'',
			numero_trabajadores:''
		}});
			this.alerta(respuesta.data.nombre, "agregada");
		});
		} else {
			alert(validado);
		}
	}
	
		/****************************************************************************
		*	modificarEmpresa es el metodo que modifica la empresa por medio del	 	*
		*	RESTful API. Recibe todos los parametros desde el FormGroup/Modal 		*
		*	que se encuentran en el render de la pagina.							*
		*	Una vez recibidos los parametros, valida que vengan correctamente		*
		*	Si está todo ok, consume el webservice, sino, envia el error			*
		*	Ya modificado, llama al metodo _actualizaEmpresas para así 				*
		*	actualizar la pagina de una forma automatica.							*	
		*	Por último, setea nuevamente los campos a vacío.						*
		****************************************************************************/
	modificarEmpresa(){
		let { nombre, numero_trabajadores, created_at } = this.state.modificaEmpresa;
        let validado = this.valida(nombre,numero_trabajadores);		
		if (validado===true){
			axios.put('http://192.168.1.13:8000/api/empresa/' + this.state.modificaEmpresa.id, {
			nombre, numero_trabajadores, created_at			
			}).then((respuesta) => {
				this._actualizaEmpresas();
				this.setState({
					modificaEmpresaModal: false, modificaEmpresa: { id:'', nombre:'', numero_trabajadores:'', created_at: '' }
				});
				this.alerta(nombre, "modificada");
			});
		}else{
			alert(validado);
		}	
	}
	
		/****************************************************************************
		*	modificaEmpresa es el metodo que recibe la información de la empresa	*
		*	y luego los posiciona en los campos del modal, esto para autocompletar	*
		*	la información y no perder continuidad de lo que se está modificando	*
		*	Acá modificamos la fecha de creación para que aparezca del tipo Date	*
		****************************************************************************/
	modificaEmpresa(id, nombre, numero_trabajadores, created_at){
		created_at = new Date(created_at).toISOString().slice(0,10);
		this.setState({
			modificaEmpresa: {id, nombre, numero_trabajadores, created_at  }, modificaEmpresaModal: ! this.state.modificaEmpresaModal
		})
		
	}
	
		/****************************************************************************
		*	borraEmpresa es el metodo que elimina la empresa por medio del		 	*
		*	RESTful API. Recibe la ID y el nombre de la empresa, para consumir		*
		*	el webservice de la forma solicitada.									*
		*	Una vez eliminado, llama al metodo _actualizaEmpresas para así 			*
		*	actualizar la pagina de una forma automatica.							*	
		*	Una vez eliminado, utilizamos el nombre de la empresa, para poder 		*
		*	una alerta con un mensaje sobre que empresa se eliminó					*	
		****************************************************************************/
	borraEmpresa(id,nombre){
		axios.delete('http://192.168.1.13:8000/api/empresa/' + id).then((respuesta) => {
			this._actualizaEmpresas();
			this.alerta(nombre, "eliminada");
		});
	}
	
		/****************************************************************************
		*	_actualizaEmpresas es el metodo obtiene la lista de todas las empresa	*
		*	desde nuestro webservice. Al principio, seteamos empresa como un		*
		*	arreglo vacío, con este metodo asignamos valores al arreglo de empresa	*
		*	y luego lo vamos desglosando según lo necesitemos						*	
		****************************************************************************/
	_actualizaEmpresas() {
		axios.get('http://192.168.1.13:8000/api/empresa').then((respuesta) => {
			this.setState({
				empresa: respuesta.data
			})
		});
	}
	
		/****************************************************************************
		*		la alerta que se envia después de agregar, eliminar o modificar		*
		****************************************************************************/
	alerta(nombre, estado) {		
		alert("La empresa " + nombre + " ha sido " + estado +".");
    }
	
		/****************************************************************************
		*	valida es el metodo que valida los campos solicitados.					*
		*	Basicamente se asegura que nombre de empresa no este vacío y que 		*
		*	la cantidad de empleados sea solo opcional (vacio) o solo numeros		*
		*	mayores a 0. Hay una lista predefinida de errores que pueden aparecer,	*
		*	así que son asignados a una constante, ya que no se modificarán			*
		*	retorna una validación positiva o el error, dependiendo del resultado	*
		****************************************************************************/
	valida (nombre,cantidad){
		let validacion = 0;
		if ((nombre.trim().length !== 0) ){
			validacion = validacion + 1;
		}
		if (cantidad.length === 0) {
			validacion = validacion + 2;
		}
		if ((parseInt(cantidad) > 0) ){
			validacion = validacion + 4;
		}
		const error = [];
		error[0] = 'Nombre de empresa no puede estar vacio \n\nCantidad de empleados debe ser un número mayor a 0.';
		error[1] = 'Cantidad de empleados debe ser número mayor a 0.';
		error[2] = 'Nombre de empresa no puede estar vacio';
		error[4] = 'Nombre de empresa no puede estar vacio';
		if (validacion === 5 || validacion === 3){
			return true;
		}else{
			return error[validacion];
		}
	}
	
	render(){
		
		/****************************************************************************
		*	En esta sección poblamos dinamicamente la tabla que se creará.			*
		*	creamos una linea por empresa, que traerá:						 		*
		*	ID																		*
		*	Nombre																	*
		*	Cantidad de trabajadores												*
		*	La fecha de creación formateada en texto								*
		*	Botones para modificar y eliminar la selección.							*
		****************************************************************************/
		let empresa = this.state.empresa.map((empresa)=> {
			return(
				<tr key={empresa.id}>
					<td>{empresa.nombre}</td>
					<td>{empresa.numero_trabajadores}</td>
					<td>
						{new Intl.DateTimeFormat('es-CL', {year: 'numeric', month: 'long', day: '2-digit'}).format(Date.parse(empresa.created_at))}</td>
					<td>
						<Button color='success' size='sm' className='mr-2' onClick={this.modificaEmpresa.bind(this, empresa.id, empresa.nombre, empresa.numero_trabajadores,empresa.created_at)}> Modificar </Button>
						<Button color='danger' size='sm' onClick={this.borraEmpresa.bind(this, empresa.id, empresa.nombre)}> Eliminar </Button>
					</td>
				</tr>
			)
		}); 
		
			
		return (
		//****************************************************************************
		//*	Acá se empieza a poblar la pagina 										*
		//****************************************************************************/
			<div className="App container">
			<h1> App para Empresas </h1>
			
		{/****************************************************************************
		*	Creamos un boton para Crear una empresa									*
		*	El boton abrirá un Modal, que solo tendrá 2 opciones:					*
		*	1) Abrir el modal si está cerrado										*
		*	2) Cerrar el modal si está abierto										*
		*	El Titulo del modal será 'Agregar Nueva Empresa'						*
		*	Se inicializa el Body del Modal, el cual tendrá 2 campos:				*
		*	1) Nombre de empresa													*
		*	2) Numero de empleados													*
		*	Cada campo traerá valores vacios, y si cambian, serán guardados 		*
		*	los nuevos valores. Esto por si se pasa a cerrar el modal sin querer	*
		*	Al final del modal, tiene 2 botones, los cuales agregan o			 	*
		*	cancelan la acción.														*
		*	El botón Agregar llama a la función "agregaEmpresa".					*
		****************************************************************************/}
				  <Button className="my-3" color="primary" onClick={this.toggleNuevaEmpresa.bind(this)}>Nueva Empresa</Button>
				  <Modal isOpen={this.state.nuevaEmpresaModal} toggle={this.toggleNuevaEmpresa.bind(this)}>
					<ModalHeader toggle={this.toggleNuevaEmpresa.bind(this)}>Agregar Nueva Empresa</ModalHeader>
					<ModalBody>
						<FormGroup>
							<Label for="empresa"> Nombre de Empresa (*) </Label>
							<Input id="empresa" value={this.state.infoNuevaEmpresa.nombre} onChange={(e) => {
								let { infoNuevaEmpresa } = this.state;
								infoNuevaEmpresa.nombre = e.target.value;
								this.setState({ infoNuevaEmpresa });
							}} />
						</FormGroup>
						<FormGroup>
							<Label for="cantidad"> Numero de empleados </Label>
							<Input id="cantidad"value={this.state.infoNuevaEmpresa.numero_trabajadores} onChange={(e) => {
								let { infoNuevaEmpresa } = this.state;
								infoNuevaEmpresa.numero_trabajadores = e.target.value;
								this.setState({ infoNuevaEmpresa });
							}} />
						</FormGroup>
					</ModalBody>
					<ModalFooter>
					  <Button color="primary" onClick={this.agregaEmpresa.bind(this)}>Agregar Empresa</Button>{' '}
					  <Button color="secondary" onClick={this.toggleNuevaEmpresa.bind(this)}>Cancelar</Button>
					</ModalFooter>
				  </Modal>
				  
		{/****************************************************************************
		*	Utilizamos el boton para modificar una empresa									*
		*	El boton abrirá un Modal, que solo tendrá 2 opciones:					*
		*	1) Abrir el modal si está cerrado										*
		*	2) Cerrar el modal si está abierto										*
		*	El Titulo del modal será 'Modificar una Empresa'						*
		*	Se inicializa el Body del Modal, el cual tendrá 3 campos:				*
		*	1) Nombre de empresa													*
		*	2) Numero de empleados													*
		*	3) Fecha de creacion 													*
		*	Cada campo traerá los valores previos de la empresa, y si cambian, 		*
		*	serán guardadoslos nuevos valores. Esto por si se pasa a cerrar			*
		*	el modal sin querer														*
		*	Al final del modal, tiene 2 botones, los cuales agregan o			 	*
		*	cancelan la acción.														*
		*	El botón Agregar llama a la función "modificarEmpresa".					*
		****************************************************************************/}
				  <Modal isOpen={this.state.modificaEmpresaModal} toggle={this.toggleModificaEmpresa.bind(this)}>
					<ModalHeader toggle={this.toggleModificaEmpresa.bind(this)}>Modificar una Empresa</ModalHeader>
					<ModalBody>
						<FormGroup>
							<Label for="empresa"> Nombre de Empresa (*) </Label>
							<Input id="empresa" value={this.state.modificaEmpresa.nombre} onChange={(e) => {
								let { modificaEmpresa } = this.state;
								modificaEmpresa.nombre = e.target.value;
								if( modificaEmpresa.nombre !== ''){
									this.setState({ modificaEmpresa });
								}
							}} />
						</FormGroup>
						<FormGroup>
							<Label for="cantidad"> Numero de empleados </Label>
							<Input id="cantidad"value={this.state.modificaEmpresa.numero_trabajadores} onChange={(e) => {
								let { modificaEmpresa } = this.state;
								modificaEmpresa.numero_trabajadores = e.target.value;
								this.setState({ modificaEmpresa });
							}} />
						</FormGroup>
						<FormGroup>
							<Label for="creacion"> Fecha de creacion </Label>
							<Input type='date' id="creacion" onChange={(e) => {
								let { modificaEmpresa } = this.state;
								modificaEmpresa.created_at = e.target.value;
								this.setState({ modificaEmpresa });
							}} value ={this.state.modificaEmpresa.created_at}/>
						</FormGroup>
					</ModalBody>
					<ModalFooter>
					  <Button color="primary" onClick={this.modificarEmpresa.bind(this)}>Modificar</Button>{' '}
					  <Button color="secondary" onClick={this.toggleModificaEmpresa.bind(this)}>Cancelar</Button>
					</ModalFooter>
				  </Modal>
				
		{/****************************************************************************
		*	Finalmente tenemos la creación de la tabla								*
		*	Esta tabla traerá como cabezera 4 titulos								*
		*	1) Empresa																*
		*	2) Cantidad de Empleados												*
		*	3) Fecha de creación													*
		*	4) Acciones																*
		*	Después de la cabezera viene el body, el cual es poblado mediante		*
		*	la variable 'empresa'.													*
		****************************************************************************/}		
				<Table> 
					<thead>
						<tr>
							<th>Empresa</th>
							<th>Cantidad de Empleados</th>
							<th>Fecha de creación</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{ empresa }
					</tbody>
				</Table>
			</div>
	  );
	}
}

export default App;
