/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {
    AppRegistry,
    Component,
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    TextInput
} from 'react-native';
import Navbar from './NavBar';
import  Slider from './Slider'
import  {NoteItem} from './NoteItem'
import SideMenu from 'react-native-side-menu'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import _ from 'lodash'
import * as notelistActions from '../actions/notelist'
import moment from 'moment'


class List extends Component {
    constructor(props) {
        super(props);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.dataSource = this.ds.cloneWithRows([])
        this.state = {
            searchText: ''
        }

    }

    _filterByTitle(data) {
        return this._mapDataSource(data).filter(note=>note.title.startsWith(this.state.searchText) || note.tagName.startsWith(this.state.searchText) );

    }

    _mapDataSource(data) {
        let source = []
        _.forIn(data, (value, key)=> {
            source.push({key, ...value})
        })
        return source;
    }

    _sortByDate(data) {
        return data.sort((a, b)=> {
            return moment(a.createdAt).isBefore(moment(b.createdAt))
        })
    }

    _handleMenuChange(isMenuOpen) {
        if (isMenuOpen !== this.props.isMenuOpen) {
            this.props.actions.setMenuStatus(isMenuOpen)
        }
    }

    _updateSearch(searchText) {
        this.setState({
            searchText
        })

    }

    _searchBar() {
        var def = "Search by title or tag..."
        let {searchWrapper, searchText}=styles;
        let boxProps = {placeholderTextColor: '#727272', autoCorrect: false};
        return <View style={searchWrapper}>
            <TextInput style={searchText}
                       placeholder={def}
                {...boxProps}
                       onChangeText={this._updateSearch.bind(this)}
                       value={this.state.searchText}>
            </TextInput>
        </View>
    }

    _renderSideMenu(navigator){
        return <Slider navigator={navigator}></Slider>;
    }

    render() {
        let enableEmptySections = true
        let edgeHitWidth = 170
        let bounceBackOnOverdraw = false
        let mappedData = this._mapDataSource(this.props.data)
        let sortedData = this._sortByDate(mappedData)
        let filteredData=this._filterByTitle(sortedData)
        let dataSource = this.ds.cloneWithRows(filteredData)
        return (
            <SideMenu
                menu={this._renderSideMenu(this.props.navigator)}
                openMenuOffset={edgeHitWidth}
                isOpen={this.props.isMenuOpen}
                onChange={(isMenuOpen)=>this._handleMenuChange(isMenuOpen)}
                bounceBackOnOverdraw={bounceBackOnOverdraw}>
                <View style={styles.container}>
                    <Navbar routeName="NoteList"
                            navigator={this.props.navigator}
                            setMenuStatus={this.props.actions.setMenuStatus}
                            isMenuOpen={this.props.isMenuOpen}/>
                    <ListView
                        dataSource={dataSource}
                        renderRow={NoteItem}
                        renderHeader={this._searchBar.bind(this)}
                        enableEmptySections={enableEmptySections}
                    />
                </View>
            </SideMenu>
        );
    }
}

const styles = StyleSheet.create({
    searchWrapper: {
        height: 40,
        borderRadius: 22,
        backgroundColor: '#D8D8D8',
        margin: 18
    },
    searchText: {
        fontFamily: 'Avenir-BookOblique',
        fontSize: 18,
        color: '#000',
        height: 40,
        marginLeft: 20,
        marginRight: 10
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#BDC3C7'

    }
});

export default connect(mapStateToProps, mapDispatchToProps)(List)


function mapStateToProps(state) {
    let {notelist}=state;
    return {
        isMenuOpen: notelist.get('isMenuOpen'),
        searchKey: notelist.get('searchKey'),
        data: notelist.get('data').toJS()
    }

}
function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators(notelistActions, dispatch)}
}