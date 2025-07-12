
export const Loader = ({
	className = '',
	classNameDiv = '',
	size = '',
	animation = true,
	color = '#fff',
	...props
}) => {
	return (
		<div className={`m-auto text-center ${classNameDiv} ` + (animation ? ' loader' : '')}>
			{size === 'small' ? (
				<span
					className={'spinner-border spinner-border-sm ' + className}
					style={{ color: color }}
					role='status'
					aria-hidden='true'
					{...props}
				></span>
			) : (
				<div className='spinner-border' style={{ color: color }} role='status'>
					<span className='visually-hidden '>Loading...</span>
				</div>
			)}
		</div>
	)
}
