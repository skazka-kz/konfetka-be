import * as React from "react";

interface IAppProps {
  loadAdminPanel: boolean;
}

class App extends React.Component {
  constructor(props: IAppProps) {
    super(props);
    this.state = {};
  }

  public render() {
    return <div>The app! Hello</div>;
  }
}

export default App;
