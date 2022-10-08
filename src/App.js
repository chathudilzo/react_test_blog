import Layout from './Layout';
import Home from './Home';
import NewPost from './NewPost';
import PostPage from './PostPage';
import About from './About';
import Missing from './Missing';
import {Route,Routes,useNavigate} from 'react-router-dom';
import {useState,useEffect} from 'react';
import {format} from 'date-fns'
import api from './api/posts'
import EditPost from './EditPost';
import useAxiosFetch from './hooks/useAxiosFetch';



function App() {
  const [posts,setPosts]=useState([]);
  const [search,setSearch]=useState('');
  const [searchResults,setSearchResults]=useState([]);
  const [postTitle,setPostTitle]=useState('');
  const [postBody,setPostBody]=useState('');
  const [editTitle,setEditTitle]=useState('');
  const [editBody,setEditBody]=useState('');
  const navigate=useNavigate();
  const {data,fetchError,isLoading}=useAxiosFetch('http://localhost:3500/posts');

  

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     try {
  //       const response = await api.get('/posts');
  //        //if(response && response.data) can use to confirm data is there
  //       setPosts(response.data);
  //     } catch (err) {
  //       if (err.response) {
  //         // Not in the 200 response range 
  //         console.log(err.response.data);
  //         console.log(err.response.status);
  //         console.log(err.response.headers);
  //       } else {
  //         console.log(`Error: ${err.message}`);
  //       }
  //     }
  //   }

  //   fetchPosts();
  // }, [])
  useEffect(()=>{
    setPosts(data);
  },[data])



  useEffect(()=>{
    const filteredResults=posts.filter((post=>
      ((post.body).toLowerCase()).includes(search.toLowerCase())
      ||((post.title).toLowerCase()).includes(search).toLowerCase()));

      setSearchResults(filteredResults.reverse());
  },[posts,search])


  const handleEdit=async(id)=>{
    const datetime=format(new Date(),'MMMM dd, yyyy pp');
    const updatedPost={id,title:editTitle,datetime,body:editBody};
    try{
      const response=await api.put(`/posts/${id}`,updatedPost);
      setPosts(posts.map(post=>post.id===id?{...response.data}:post));
      setEditTitle('');
      setEditBody('');
      navigate('/');
    }catch(err){
      console.log(`Error: ${err.message}`)
    }
  }


  const handleSubmit=async(e)=>{
    e.preventDefault();
    const id=posts.length? posts[posts.length-1].id+1:1;
    const datetime=format(new Date(),'MMMM dd, yyyy pp');
    const newPost={id,title:postTitle,datetime,body:postBody}
    try{
      const response=await api.post('/posts',newPost);
      const allPosts=[...posts,response.data];
      setPosts(allPosts)
      setPostTitle('');
      setPostBody('');
      navigate('/');
    }catch(err){
      console.log(`Error: ${err.message}`)
    }
    
  }
  const handleDelete=async(id)=>{
    try{
      await api.delete(`/posts/${id}`);
      const postList=posts.filter(post=>post.id !== id)
    setPosts(postList);
    navigate('/');
    }catch(err){
      console.log(`Error: ${err.message}`)
    }
    
  }

  return (
    
      <Routes>
        <Route path='/' element={<Layout
          search={search}
          setSearch={setSearch}
          
        />}>
          <Route index element={<Home 
          posts= {searchResults}
          fetchError={fetchError}
          isLoading={isLoading}
          />}/>
          <Route path='post'>
              <Route index element=
                {
                    <NewPost 
                    handleSubmit={handleSubmit}
                    postTitle={postTitle}
                    setPostTitle={setPostTitle}
                    postBody={postBody}
                    setPostBody={setPostBody}
                  />
                  }
              />
            <Route path='/post/:id' element={
              <PostPage
                posts={searchResults}
                handleDelete={handleDelete}
              />
            }
            />
            {/* <Route path='/post/:id/edit/:id' element=
                {
                    <EditPost 
                    handleEdit={handleEdit}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    editBody={editBody}
                    setEditBody={setEditBody}
                  />
                  }
              /> */}
            
        </Route>
        
        <Route path='/about' element={<About/>}/>
        <Route path='*' element={<Missing/>}/>
        </Route> 
      </Routes>
  );
}

export default App;
