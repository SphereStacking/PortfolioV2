precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

// 設定可能なパラメータ
#define MAX_ITERATIONS 5// 最大再帰深度
#define MIN_ITERATIONS 2// アニメーションの最小反復数
#define MAX_ANIM_ITERATIONS 10// アニメーションの最大反復数

// 重心座標を使用して点が三角形内にあるかチェック
bool pointInTriangle(vec2 p,vec2 a,vec2 b,vec2 c){
    float denom=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
    if(abs(denom)<.001)return false;
    
    float u=((b.y-c.y)*(p.x-c.x)+(c.x-b.x)*(p.y-c.y))/denom;
    float v=((c.y-a.y)*(p.x-c.x)+(a.x-c.x)*(p.y-c.y))/denom;
    float w=1.-u-v;
    
    return u>=0.&&v>=0.&&w>=0.;
}

// 再帰的三角形分割法
float sierpinskiRecursive(vec2 pos,int maxDepth){
    // メイン三角形の頂点
    vec2 a=vec2(0.,.8);// 上
    vec2 b=vec2(-.8,-.8);// 左下
    vec2 c=vec2(.8,-.8);// 右下
    
    // 点がメイン三角形の外側にある場合
    if(!pointInTriangle(pos,a,b,c)){
        return 0.;
    }
    
    // 再帰的に点が除去された三角形内にあるかチェック
    vec2 currentA=a;
    vec2 currentB=b;
    vec2 currentC=c;
    
    for(int depth=0;depth<MAX_ITERATIONS;depth++){
        if(depth>=maxDepth)break;
        
        // 中点を計算
        vec2 midAB=(currentA+currentB)*.5;
        vec2 midBC=(currentB+currentC)*.5;
        vec2 midCA=(currentC+currentA)*.5;
        
        // 点が中央の（除去された）三角形内にあるかチェック
        if(pointInTriangle(pos,midAB,midBC,midCA)){
            return 0.;// 点は除去領域内
        }
        
        // 点がどの副三角形に含まれるか判定
        if(pointInTriangle(pos,currentA,midAB,midCA)){
            // 上の三角形
            currentB=midAB;
            currentC=midCA;
        }else if(pointInTriangle(pos,midAB,currentB,midBC)){
            // 左下の三角形
            currentA=midAB;
            currentC=midBC;
        }else if(pointInTriangle(pos,midCA,midBC,currentC)){
            // 右下の三角形
            currentA=midCA;
            currentB=midBC;
        }else{
            // 点がメイン三角形内なら発生しないはず
            return 0.;
        }
    }
    
    return 1.;
}

void main(){
    vec2 st=(gl_FragCoord.xy-.5*u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // スケールアニメーション（デフォルトサイズを小さく）
    float scale=.5+.2*sin(u_time*.5);// 0.3倍から0.7倍の間でスケール
    vec2 scaled_st=st/scale;// スケール適用
    
    // 回転アニメーション
    float rotation=u_time*.2;// 回転速度
    float cosR=cos(rotation);
    float sinR=sin(rotation);
    
    // スケール済み座標に回転マトリックスを適用
    vec2 transformed_st=vec2(
        scaled_st.x*cosR-scaled_st.y*sinR,
        scaled_st.x*sinR+scaled_st.y*cosR
    );
    
    // 設定可能な範囲での時間ベースアニメーション
    float time_factor=sin(u_time*.3)*.5+.5;
    // 1から5まで段階的に変化（MAX_ITERATIONSが5なので）
    int iterations=int(mix(1.,5.,time_factor));
    
    // 変換された座標で再帰メソッド使用
    float pattern=sierpinskiRecursive(transformed_st,iterations);
    
    // サイケデリックなメタリックカラー
    float colorTime=u_time*.8;
    vec3 color1=vec3(
        .8+.2*sin(colorTime),// ゴールド/コッパー
        .4+.3*sin(colorTime+2.),
        .1+.2*sin(colorTime+4.)
    );
    vec3 color2=vec3(
        .3+.4*sin(colorTime+1.),// エレクトリック紫/シアン
        .2+.5*sin(colorTime+3.),
        .7+.3*sin(colorTime+5.)
    );
    vec3 color3=vec3(
        .2+.3*sin(colorTime+2.5),// ネオン緑/マゼンタ
        .8+.2*sin(colorTime+.5),
        .4+.4*sin(colorTime+3.5)
    );
    
    vec3 background=vec3(.05,.02,.08);// 深い紫の背景
    
    // 多層カラーミキシング
    vec3 mixedColor=mix(color1,color2,sin(time_factor*3.14159));
    mixedColor=mix(mixedColor,color3,cos(time_factor*2.*3.14159)*.5+.5);
    
    // メタリックシマー効果を追加
    float shimmer=sin(u_time*4.+transformed_st.x*10.+transformed_st.y*8.)*.1+.9;
    mixedColor*=shimmer;
    
    vec3 finalColor=mix(background,mixedColor,pattern);
    
    // カラーバリエーション付き強化グロー
    float glow=smoothstep(0.,.05,pattern);
    vec3 glowColor=vec3(
        .8+.2*sin(u_time*2.),
        .4+.4*sin(u_time*2.3+1.),
        .7+.3*sin(u_time*1.8+2.)
    );
    finalColor=mix(background,finalColor+glowColor*glow*.3,glow);
    
    gl_FragColor=vec4(finalColor,1.);
}
