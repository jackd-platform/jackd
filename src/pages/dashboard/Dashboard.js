import React, {Component} from 'react'
import {withTranslation} from 'react-i18next'
import {connect} from 'react-redux'
import {FeatureTour} from '../../components/FeatureTour'
import {ACTION_GET_DATA_START, ACTION_PARSE_URL_PARAMS} from '../../global/constants'
import {action} from '../../global/util'
import {Graphs} from './graphs/Graphs'
import {Tables} from './tables/Tables'

class DashboardComponent extends Component {
  componentDidMount() {
    const {match, overview} = this.props

    if (match?.params) {
      action(ACTION_PARSE_URL_PARAMS, {params: match.params})
    }

    if (!overview.data) {
      action(ACTION_GET_DATA_START)
    }
  }

  render() {
    return (
      <>
        <FeatureTour />
        <Graphs />
        <Tables />
      </>
    )
  }
}

const stateToProps = state => ({
  overview: state.overview,
})

const dispatchToProps = {}

export const Dashboard = connect(stateToProps, dispatchToProps)(withTranslation()(DashboardComponent))
