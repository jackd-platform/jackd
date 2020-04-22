import moment from 'moment'
import {
  ACTION_CHANGE_DATE_FILTER_INTERVAL,
  ACTION_CHANGE_DATE_FILTER_MODE,
  ACTION_CHANGE_GEOID_SELECTION,
  ACTION_CHANGE_VIEW_MODE,
  ACTION_CLEAR_NOTIFICATION,
  ACTION_GET_DATA_FAIL,
  ACTION_GET_DATA_START,
  ACTION_GET_DATA_SUCCESS,
  ACTION_REPARSE_DATA,
  ACTION_SET_NOTIFICATION,
  ASYNC_STATUS,
  DATE_FILTER,
  DATE_FORMAT_APP,
  VIEW_MODE,
} from '../../global/constants'
import {parseRawData} from '../../global/dataParsing'

const initialState = {
  notification: {},
  loadingStatus: ASYNC_STATUS.IDLE,
  data: null,
  viewMode: VIEW_MODE.COMBO,
  tableVisible: true,
  graphsVisible: true,
  dateFilter: {
    startDate: null,
    endDate: null,
    mode: DATE_FILTER.TOTAL,
  },
  selectedGeoIds: {},
}

const preselectedGeoIds = ['WW', 'US', 'CN', 'DE', 'FR', 'ES', 'IT', 'CH']

export const overview = (state = initialState, action = {}) => {
  // noinspection FallThroughInSwitchStatementJS
  switch (action.type) {
    case ACTION_SET_NOTIFICATION:
      return {
        ...state,
        notification: {
          ...state.notification,
          message: action.message,
          variant: action.variant || 'info',
          showSpinner: action.showSpinner || false,
        },
      }

    case ACTION_CLEAR_NOTIFICATION:
      return {
        ...state,
        notification: initialState.notification,
      }

    case ACTION_GET_DATA_START:
      return {
        ...initialState,
        loadingStatus: ASYNC_STATUS.PENDING,
      }

    case ACTION_REPARSE_DATA:
      if (!state.data?.rawData) {
        return {
          ...state,
          notification: {
            ...state.notification,
            message: 'global:error_no_data_loaded',
            variant: 'danger',
            showSpinner: false,
          },
        }
      }
      action.result = {
        records: state.data.rawData,
      }
    // intentional fallthrough
    case ACTION_GET_DATA_SUCCESS:
      const parsedData = parseRawData(action.result.records)
      if (!parsedData) {
        return {
          ...state,
          notification: {
            ...state.notification,
            message: 'global:error_invalid_api_data',
            variant: 'danger',
            showSpinner: false,
          },
        }
      }

      let selectedGeoIds = {}
      if (parsedData.geoIds) {
        parsedData.geoIds.map(geoId => {
          selectedGeoIds[geoId] = preselectedGeoIds.includes(geoId)
        })
      }

      return {
        ...state,
        loadingStatus: ASYNC_STATUS.SUCCESS,
        data: {
          ...state.data,
          ...parsedData,
        },
        dateFilter: {
          startDate: moment(parsedData.endDate, DATE_FORMAT_APP)
            .subtract(14, 'days')
            .format(DATE_FORMAT_APP),
          endDate: parsedData.endDate,
          mode: DATE_FILTER.LAST_14_DAYS,
        },
        selectedGeoIds: selectedGeoIds,
      }

    case ACTION_GET_DATA_FAIL:
      return {
        ...state,
        loadingStatus: ASYNC_STATUS.FAIL,
        notification: {
          ...state.notification,
          message: action.error,
          variant: 'danger',
          showSpinner: false,
        },
      }

    case ACTION_CHANGE_DATE_FILTER_MODE:
      const dateFilter = {
        ...state.dateFilter,
        startDate: state.data?.startDate,
        endDate: state.data?.endDate,
        mode: action.mode,
      }

      switch (action.mode) {
        default:
        case DATE_FILTER.TOTAL:
          break
        case DATE_FILTER.LAST_DAY:
          if (state.data?.endDate) {
            dateFilter.startDate = state.data?.endDate
          }
          break
        case DATE_FILTER.LAST_7_DAYS:
          if (state.data?.endDate) {
            dateFilter.startDate = moment(state.data.endDate, DATE_FORMAT_APP)
              .subtract(7, 'days')
              .format(DATE_FORMAT_APP)
          }
          break
        case DATE_FILTER.LAST_14_DAYS:
          if (state.data?.endDate) {
            dateFilter.startDate = moment(state.data.endDate, DATE_FORMAT_APP)
              .subtract(14, 'days')
              .format(DATE_FORMAT_APP)
          }
          break
        case DATE_FILTER.LAST_30_DAYS:
          if (state.data?.endDate) {
            dateFilter.startDate = moment(state.data.endDate, DATE_FORMAT_APP)
              .subtract(30, 'days')
              .format(DATE_FORMAT_APP)
          }
          break
      }

      return {
        ...state,
        dateFilter,
      }

    case ACTION_CHANGE_DATE_FILTER_INTERVAL:
      let newState = {...state}

      if (action.startDate) {
        newState.dateFilter.startDate = action.startDate
      }
      if (action.endDate) {
        newState.dateFilter.endDate = action.endDate
      }

      return newState

    case ACTION_CHANGE_GEOID_SELECTION:
      const newSelectedGeoIds = {...state.selectedGeoIds}
      newSelectedGeoIds[action.geoId] = action.selected

      return {
        ...state,
        selectedGeoIds: newSelectedGeoIds,
      }

    case ACTION_CHANGE_VIEW_MODE:
      let tableVisible = true
      let graphsVisible = true
      switch (action.viewMode) {
        default:
        case VIEW_MODE.COMBO:
          break
        case VIEW_MODE.GRAPHS:
          tableVisible = false
          break
        case VIEW_MODE.TABLE:
          graphsVisible = false
          break
      }

      return {
        ...state,
        viewMode: action.viewMode,
        tableVisible: tableVisible,
        graphsVisible: graphsVisible,
      }

    default:
      return state
  }
}
