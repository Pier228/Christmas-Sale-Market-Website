import '../../styles/components/footer/rounded-button.css'

interface IProps {
  children: string;
  className?: string;
}

function RoundedButton(props: IProps) {
  return (
    <button
      className={'rounded-button ' + props.className}
    >
      {props.children}
    </button>
  )
}

export default RoundedButton;