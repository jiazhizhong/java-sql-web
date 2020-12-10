package org.guohai.javasqlweb.dao;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.guohai.javasqlweb.beans.UserBean;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * 管理操作类
 * @author guohai
 */
@Repository
public interface AdminDao {

    /**
     * 查询指定用户名密码的用户数据是否存在
     * @param name
     * @param Pass
     * @return
     */
    @Select("SELECT user_name,auth_status FROM user_tb WHERE user_name=#{name} AND pass_word=md5(CONCAT(md5(#{pass}),'jsa'))")
    UserBean getUserByName(@Param("name") String name, @Param("pass") String Pass);

    /**
     * 更新用户登录令牌
     * @param name
     * @param token
     * @return
     */
    @Update("UPDATE user_tb SET token=#{token} WHERE user_name=#{name}")
    Boolean setUserToken(@Param("name") String name, @Param("token") String token);

    /**
     * 通过用户令牌查找用户
     * @param token
     * @return
     */
    @Select("SELECT user_name,auth_status FROM user_tb WHERE token=#{token}")
    UserBean getUserByToken(@Param("token") String token);

    /**
     * 设置用户二次验证的密钥,和登录临时token
     * @param secret
     * @param token
     * @return
     */
    @Update("UPDATE user_tb SET auth_secret=#{secret},auth_status='BINDING' WHERE token=#{token}")
    Boolean setUserSecret(@Param("secret") String secret, @Param("token") String token);

    /**
     * 通过令牌查询用户二次验证密钥
     * @param token
     * @return
     */
    @Select("SELECT auth_secret,auth_status FROM user_tb WHERE token=#{token}")
    UserBean getUserSecret(@Param("token") String token);

}
