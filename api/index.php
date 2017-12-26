<!--
-   Accelerider.Web.share
-   made    by zishuo
-   date    12/26/2017
-   ver     1.0.1
-->
<?php
header('Content-Type:application/json; charset=utf-8'); 
$url = 'http://api.usmusic.cn/';//shareid=6W5sohavmJaV&pass=xx
$in = in();
if(!empty($in)){
    $shareid = empty($in['shareid'])?'':$in['shareid'];
    $token = empty($in['token'])?'':$in['token'];
    $pass = empty($in['pass'])?'':$in['pass'];
    $path = empty($in['path'])?'/':$in['path'];
    $path = str_replace('//','/',urldecode($path));
    $filename = empty($in['filename'])?'':$in['filename'];
    $filename = str_replace('//','/',urldecode($filename));
    if($token && $filename){
        $str = file_get_contents($url."cloud/sharelink?token={$token}&web=1&path=".urlencode($filename));
    }elseif($token){
        $str = file_get_contents($url."cloud/sharefiles?token={$token}&path=".urlencode($path));
    }else{
        $str = file_get_contents($url."cloud/sharefiles?shareid={$shareid}&pass=".urlencode($pass));
    }
    if($str){
        $str = json_decode($str,true);
        if($str['errno'] == 0 && !$token){
            $data = $str;
        }elseif($str['errno'] == 0 && $filename){
            $data = $str;
        }elseif($str['errno'] == 0 && $token){
            foreach ($str['list'] as $vo) {
                if($vo['dir'] == 1){
                    $data['DIR'][] = $vo['fileName'].';'.$vo['size'].';'.$vo['ctime'].';;;';
                }else{
                    $data['FILES'][] = $vo['fileName'].';'.$vo['size'].';'.$vo['ctime'].';;;';
                }
                
                if(empty($data['DIR'])){
                    $data['DIR']=[];
                }
                if(empty($data['FILES'])){
                    $data['FILES']=[];
                }
            }
            $data['PATH']=$path;
        }else{
            $data = $str;
        }
    }else{
        $data['errno'] = 1;
        $data['shareid']= $shareid;
        $data['errmsg'] = 'errno';
    }
}else{
    $data['errno'] = 1;
    $data['errmsg'] = '缺少必要的参数';
    
}
function stripslashes_deep($a)
{
    $a = is_array($a) ? array_map('stripslashes_deep', $a) : (isset($a) ? stripslashes($a) : null);
    return $a;
}
function in()
{
    global $_GET, $_POST, $_COOKIE;
    $_COOKIE = stripslashes_deep($_COOKIE);
    $_GET = stripslashes_deep($_GET);
    $_POST = stripslashes_deep($_POST);
    $f = array();
    $f = array_merge($_GET, $_POST);
    return $f;
}
$data = json_encode($data);
exit($data);