import Error from "next/error";

function CustomErrorComponent(props) {
  return <Error statusCode={props.statusCode} />;
}

CustomErrorComponent.getInitialProps = async (contextData) => {
  // Sentry disabled for now
  // TODO: Re-enable Sentry when configured
  
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
