import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import './App.css';

const url = "https://server-web4.herokuapp.com";
//const url = "http://localhost:3001";


const particlesOptions = {
  particles: {
    number: {
      value: 40,
      density: {
        enable: true,
        value_area: 300
      }
    }
  }
}

const initialState = {
  input: '',
  box: [{}],
  route: 'signin',
  isSignedIn: localStorage.getItem('isSignedIn') || false,
  disableFind: true,
  user: JSON.parse(localStorage.getItem('user')) || {
    id: 0,
    name: "",
    email: "",
    entries: 0,
    joined: ""
  }
};

class App extends Component {

  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entry,
        joined: data.joined
      }
    });
    localStorage.setItem('user', JSON.stringify(this.state.user));
  }

  onInputChange = (event) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const formData = new FormData();
      files.forEach((file, i) => {
        formData.append(i, file)
      })
      fetch("https://server-web4.herokuapp.com/image-upload", {
        method: 'post',
        body: formData
      })
        .then(res => res.json())
        .then(images => {
          this.setState({ input: images[0].url, disableFind: false });
        })
    } else {
      this.setState({ input: event.target.value, disableFind: false });
    }

    this.setState({ box: [{}] });
  }

  onInputClear = () => {
    this.setState({ input: '', box: [{}], disableFind: false });
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch("https://server-web4.herokuapp.com/imageurl", {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response => {
      if (response) {
        fetch("https://server-web4.herokuapp.com/image", {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count }));
          })
          .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response));
    })
    .catch(err => console.log(err));
  }

  calculateFaceLocation = (data) => {
    if (data === -1 || Object.keys(data.outputs[0].data).length === 0) { return []; }

    var a = data.outputs[0].data.regions;
    var faces = [];

    for (var i = 0; i < a.length; i++) {
      faces.push(a[i].region_info.bounding_box);
    }

    var image = document.getElementById("inputImage");
    var width = Number(image.width);
    var height = Number(image.height);

    var boxes = faces.map(s => {
      return {
        leftCol: s.left_col * width,
        topRow: s.top_row * height,
        rightCol: width - (s.right_col * width),
        bottomRow: height - (s.bottom_row * height)
      }
    });
    return boxes;
  }

  displayFaceBox = (box) => {
    this.setState({ box: box || []});
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn:false});
      localStorage.removeItem('isSignedIn');
      route = 'signin'
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
      localStorage.setItem('isSignedIn', true);
    }
    this.setState({ route: route });
  }

  render() {
    let { box, input, route, isSignedIn, disableFind, user} = this.state;

    return (
      <div className="App">
        <Particles 
          className="particles" 
          params={particlesOptions}
        />
        <Navigation 
          onRouteChange={this.onRouteChange} 
          isSignedIn={isSignedIn} 
        />
        
        {isSignedIn
          ? <div>
              <div className="logo-rank">
                <Rank name={user.name} entries={user.entries} />
              </div>
              {
              
                <>
                  <ImageLinkForm 
                    input={input}
                    onInputChange={this.onInputChange} 
                    onButtonSubmit={this.onButtonSubmit} 
                    disableFind={disableFind}
                    onInputClear={this.onInputClear}
                  />
                  {input && <FaceRecognition box={box} imageUrl={input} />}
                </>
              }
          </div>
          : (route === 'signin' || route === 'signout'
            ? <Signin 
                loadUser={this.loadUser} 
                onRouteChange={this.onRouteChange} 
                url={url} 
              />
            : <Register 
                loadUser={this.loadUser} 
                onRouteChange={this.onRouteChange}  
                url={url} 
              />
            )
        }
      </div>
    );
  }
}

export default App;