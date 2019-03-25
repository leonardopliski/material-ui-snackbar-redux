import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import Button from '@material-ui/core/Button'
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import actions from './actions'

// default snackbar styles
const snackbarStyles = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  default: { }
});

class SnackbarProvider extends PureComponent {
  state = {
    open: false,
    message: null,
    action: null,
    variant: null
  }

  getChildContext () {
    return {
      snackbar: {
        show: this.props.show
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.snackbar !== prevProps.snackbar) {
      if (this.props.snackbar) {
        if (this.state.open) {
          this.setState({ open: false })
        } else {
          this.processQueue()
        }
      }
    }
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') return
    this.setState({ open: false, handleAction: null })
  }

  handleExited = () => {
    this.processQueue()
  }

  handleActionClick = () => {
    this.handleClose()
    this.state.handleAction()
  }

  processQueue = () => {
    if (this.props.snackbar) {
      const { message, action, handleAction } = this.props.snackbar
      this.setState({ open: true, message, action, handleAction })
      this.props.dismiss(this.props.snackbar.id)
    }
  }

  render () {
    const { children, SnackbarProps = {}, classes } = this.props
    const { action, message, open, variant } = this.state

    return (
      <React.Fragment>
        {children}
        <Snackbar {...SnackbarProps}
          open={open}
        >
          <SnackbarContent
            className={classNames(classes[variant])}
            message={message || ''}
            action={action && (
              <Button color="inherit" size="small" onClick={this.handleActionClick}>
                {action}
              </Button>
            )}
            onClose={this.handleClose}
            onExited={this.handleExited}
          >
          </SnackbarContent>
        </Snackbar>
      </React.Fragment>
    )
  }
}

SnackbarProvider.childContextTypes = {
  snackbar: PropTypes.object
}

SnackbarProvider.propTypes = {
  children: PropTypes.node,
  SnackbarProps: PropTypes.object,
  classes: PropTypes.object.isRequired,
}

export default connect(
  state => ({
    snackbar: state.snackbar.queue[0] || null
  }),
  dispatch => ({
    show: (message, action, handleAction, variant = "default") => dispatch(actions.show({ message, action, handleAction, variant})),
    dismiss: (id) => dispatch(actions.dismiss({ id }))
  })
)(withStyles(snackbarStyles)(SnackbarProvider))
