import React from 'react';
import queryString from 'query-string';
import { fetchItem, fetchComments } from '../utils/api';
import Loading from './Loading';
import PostMetaInfo from './PostMetaInfo';
import Title from './Title';
import Comment from './Comment';

function postReducer(state, action) {
   if (action.type === 'fetch') {
      return {
         ...state,
         loadingPost: true,
         loadingComments: true,
      };
   } else if (action.type === 'post') {
      return {
         ...state,
         post: action.post,

         loadingPost: action.loadingPost,
      };
   } else if (action.type === 'comment') {
      return {
         ...state,
         comments: action.comments,
         loadingComments: action.loadingComments,
      };
   } else if (action.type === 'error') {
      return {
         ...state,
         error: action.error,
         loadingComments: action.loadingComments,
         loadingPost: action.loadingPost,
      };
   } else {
      throw new Error('Action is not defined');
   }
}

export default function Post({ location }) {
   const { id } = queryString.parse(location.search);
   const [state, dispatch] = React.useReducer(postReducer, {
      post: null,
      loadingPost: true,
      comments: null,
      loadingComments: true,
      error: null,
   });

   React.useEffect(() => {
      dispatch({ type: 'fetch' });
      fetchItem(id)
         .then((post) => {
            dispatch({ type: 'post', post, loadingPost: false });
            return fetchComments(post.kids || []);
         })
         .then((comments) =>
            dispatch({ type: 'comment', comments, loadingComments: false })
         )
         .catch(({ message }) =>
            dispatch({
               type: 'error',
               error: message,
               loadingPost: false,
               loadingComments: false,
            })
         );
   }, [id]);

   const { post, loadingPost, comments, loadingComments, error } = state;
   console.log(comments);
   if (error) {
      return <p className='center-text error'>{error}</p>;
   }
   return (
      <React.Fragment>
         {loadingPost === true ? (
            <Loading text='Fetching post' />
         ) : (
            <React.Fragment>
               <h1 className='header'>
                  <Title url={post.url} title={post.title} id={post.id} />
               </h1>
               <PostMetaInfo
                  by={post.by}
                  time={post.time}
                  id={post.id}
                  descendants={post.descendants}
               />
               <p dangerouslySetInnerHTML={{ __html: post.text }} />
            </React.Fragment>
         )}
         {loadingComments === true ? (
            loadingPost === false && <Loading text='Fetching comments' />
         ) : (
            <React.Fragment>
               {comments.map((comment) => (
                  <Comment key={comment.id} comment={comment} />
               ))}
            </React.Fragment>
         )}
      </React.Fragment>
   );
}

// export default class Post extends React.Component {
//    state = {
//       post: null,
//       loadingPost: true,
//       comments: null,
//       loadingComments: true,
//       error: null,
//    };
//    componentDidMount() {
//       const { id } = queryString.parse(this.props.location.search);

//       fetchItem(id)
//          .then((post) => {
//             this.setState({ post, loadingPost: false });

//             return fetchComments(post.kids || []);
//          })
//          .then((comments) =>
//             this.setState({
//                comments,
//                loadingComments: false,
//             })
//          )
//          .catch(({ message }) =>
//             this.setState({
//                error: message,
//                loadingPost: false,
//                loadingComments: false,
//             })
//          );
//    }
//    render() {
//       const { post, loadingPost, comments, loadingComments, error } =
//          this.state;

//       if (error) {
//          return <p className='center-text error'>{error}</p>;
//       }

//       return (
//          <React.Fragment>
//             {loadingPost === true ? (
//                <Loading text='Fetching post' />
//             ) : (
//                <React.Fragment>
//                   <h1 className='header'>
//                      <Title url={post.url} title={post.title} id={post.id} />
//                   </h1>
//                   <PostMetaInfo
//                      by={post.by}
//                      time={post.time}
//                      id={post.id}
//                      descendants={post.descendants}
//                   />
//                   <p dangerouslySetInnerHTML={{ __html: post.text }} />
//                </React.Fragment>
//             )}
//             {loadingComments === true ? (
//                loadingPost === false && <Loading text='Fetching comments' />
//             ) : (
//                <React.Fragment>
//                   {comments.map((comment) => (
//                      <Comment key={comment.id} comment={comment} />
//                   ))}
//                </React.Fragment>
//             )}
//          </React.Fragment>
//       );
//    }
// }
